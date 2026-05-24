import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const LoginScreen = ({ password, onPasswordChange, onLogin }) => {
  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[9999]">
      <form onSubmit={e => { e.preventDefault(); onLogin(password); }} className="max-w-sm w-full px-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#a08550] flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-[#0a0a0b]" />
          </div>
          <h1 className="text-2xl font-bold text-[#f0ede8] mb-2">Studio Pro</h1>
          <p className="text-sm text-[#5a5a5e]">Admin Login</p>
        </div>
        <Input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => onPasswordChange(e.target.value)}
          className="bg-[#111318] border-[#1e1e22] text-[#f0ede8] h-12 mb-4 text-center"
        />
        <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-12 font-semibold">Access Editor</Button>
      </form>
    </div>
  );
};
