"""
WebSocket Routes - Real-time collaboration for CMS Editor
"""
import socketio
import logging
import json
from typing import Dict, Set
from datetime import datetime, timezone

from services.ai_service import ai_service

logger = logging.getLogger(__name__)

# Socket.IO server instance
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

# Track connected clients and their editing state
connected_clients: Dict[str, dict] = {}
page_editors: Dict[str, Set[str]] = {}  # page_id -> set of session_ids
block_locks: Dict[str, str] = {}  # block_id -> session_id (who's editing)


@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    logger.info(f"Client connected: {sid}")
    connected_clients[sid] = {
        "connected_at": datetime.now(timezone.utc).isoformat(),
        "page": None,
        "user": None
    }


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {sid}")
    
    # Clean up page editors
    for page_id, editors in list(page_editors.items()):
        if sid in editors:
            editors.discard(sid)
            # Notify others that user left
            await sio.emit('user_left', {'session_id': sid}, room=page_id)
    
    # Release any block locks held by this client
    for block_id, lock_holder in list(block_locks.items()):
        if lock_holder == sid:
            del block_locks[block_id]
            # Notify others that lock is released
            if connected_clients.get(sid, {}).get('page'):
                await sio.emit('block_unlocked', {'block_id': block_id}, room=connected_clients[sid]['page'])
    
    # Remove from connected clients
    if sid in connected_clients:
        del connected_clients[sid]


@sio.event
async def join_page(sid, data):
    """Join a page editing session"""
    page_id = data.get('page', 'home')
    user = data.get('user', 'Anonymous')
    
    # Update client info
    connected_clients[sid] = {
        **connected_clients.get(sid, {}),
        "page": page_id,
        "user": user
    }
    
    # Add to page room
    await sio.enter_room(sid, page_id)
    
    # Track page editors
    if page_id not in page_editors:
        page_editors[page_id] = set()
    page_editors[page_id].add(sid)
    
    # Get list of other editors
    other_editors = [
        {"session_id": s, "user": connected_clients.get(s, {}).get('user', 'Anonymous')}
        for s in page_editors[page_id] if s != sid
    ]
    
    # Notify the client about current state
    await sio.emit('joined_page', {
        'page': page_id,
        'editors': other_editors,
        'block_locks': {k: v for k, v in block_locks.items() if v != sid}
    }, room=sid)
    
    # Notify others that user joined
    await sio.emit('user_joined', {
        'session_id': sid,
        'user': user
    }, room=page_id, skip_sid=sid)
    
    logger.info(f"Client {sid} joined page {page_id}")


@sio.event
async def leave_page(sid, data):
    """Leave a page editing session"""
    page_id = data.get('page', 'home')
    
    # Leave room
    await sio.leave_room(sid, page_id)
    
    # Remove from page editors
    if page_id in page_editors:
        page_editors[page_id].discard(sid)
    
    # Release any locks
    for block_id, lock_holder in list(block_locks.items()):
        if lock_holder == sid:
            del block_locks[block_id]
            await sio.emit('block_unlocked', {'block_id': block_id}, room=page_id)
    
    # Notify others
    await sio.emit('user_left', {'session_id': sid}, room=page_id)
    
    # Update client info
    if sid in connected_clients:
        connected_clients[sid]['page'] = None


@sio.event
async def lock_block(sid, data):
    """Request lock on a block for editing"""
    block_id = data.get('block_id')
    page_id = connected_clients.get(sid, {}).get('page')
    
    if not block_id or not page_id:
        await sio.emit('lock_denied', {'block_id': block_id, 'reason': 'Invalid request'}, room=sid)
        return
    
    # Check if block is already locked
    if block_id in block_locks and block_locks[block_id] != sid:
        await sio.emit('lock_denied', {
            'block_id': block_id,
            'locked_by': connected_clients.get(block_locks[block_id], {}).get('user', 'Another user'),
            'reason': 'Block is being edited by another user'
        }, room=sid)
        return
    
    # Grant lock
    block_locks[block_id] = sid
    await sio.emit('lock_granted', {'block_id': block_id}, room=sid)
    
    # Notify others
    user = connected_clients.get(sid, {}).get('user', 'Anonymous')
    await sio.emit('block_locked', {
        'block_id': block_id,
        'locked_by': user,
        'session_id': sid
    }, room=page_id, skip_sid=sid)


@sio.event
async def unlock_block(sid, data):
    """Release lock on a block"""
    block_id = data.get('block_id')
    page_id = connected_clients.get(sid, {}).get('page')
    
    if not block_id:
        return
    
    # Only release if this client holds the lock
    if block_locks.get(block_id) == sid:
        del block_locks[block_id]
        await sio.emit('block_unlocked', {'block_id': block_id}, room=page_id)


@sio.event
async def update_block(sid, data):
    """Broadcast block update to other editors"""
    block_id = data.get('block_id')
    field = data.get('field')
    value = data.get('value')
    page_id = connected_clients.get(sid, {}).get('page')
    
    if not all([block_id, field is not None, page_id]):
        return
    
    # Broadcast to others on the same page
    await sio.emit('block_updated', {
        'block_id': block_id,
        'field': field,
        'value': value,
        'by': connected_clients.get(sid, {}).get('user', 'Anonymous'),
        'session_id': sid
    }, room=page_id, skip_sid=sid)


@sio.event
async def cursor_move(sid, data):
    """Broadcast cursor position for collaborative awareness"""
    page_id = connected_clients.get(sid, {}).get('page')
    if not page_id:
        return
    
    await sio.emit('cursor_moved', {
        'session_id': sid,
        'user': connected_clients.get(sid, {}).get('user', 'Anonymous'),
        'position': data.get('position', {}),
        'block_id': data.get('block_id')
    }, room=page_id, skip_sid=sid)


@sio.event
async def ai_generate_request(sid, data):
    """Handle AI content generation request with streaming"""
    block_id = data.get('block_id')
    block_type = data.get('block_type', 'text')
    field = data.get('field', 'content')
    current_value = data.get('current_value')
    context = data.get('context')
    page_id = connected_clients.get(sid, {}).get('page')
    
    # Notify client that generation started
    await sio.emit('ai_generation_started', {
        'block_id': block_id,
        'field': field
    }, room=sid)
    
    try:
        # Generate content
        content = await ai_service.generate_block_content(
            block_type=block_type,
            field=field,
            current_value=current_value,
            context=context
        )
        
        # Send result to requesting client
        await sio.emit('ai_generation_complete', {
            'block_id': block_id,
            'field': field,
            'content': content,
            'success': True
        }, room=sid)
        
        # Optionally broadcast to others that AI content was generated
        if page_id:
            await sio.emit('ai_content_generated', {
                'block_id': block_id,
                'field': field,
                'by': connected_clients.get(sid, {}).get('user', 'Anonymous')
            }, room=page_id, skip_sid=sid)
        
    except Exception as e:
        logger.error(f"AI generation error: {str(e)}")
        await sio.emit('ai_generation_complete', {
            'block_id': block_id,
            'field': field,
            'success': False,
            'error': str(e)
        }, room=sid)


@sio.event
async def save_page(sid, data):
    """Notify all editors that page was saved"""
    page_id = connected_clients.get(sid, {}).get('page')
    if not page_id:
        return
    
    user = connected_clients.get(sid, {}).get('user', 'Anonymous')
    await sio.emit('page_saved', {
        'page': page_id,
        'by': user,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }, room=page_id)


def get_socket_app():
    """Get the ASGI app for Socket.IO"""
    return socketio.ASGIApp(sio)
