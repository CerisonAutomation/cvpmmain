import os
import sys

def verify():
    required_files = [
        'src/lib/cms/content.ts',
        'src/lib/cms/types.ts',
        'src/components/CmsPage.tsx',
        'src/components/blocks/BlockRenderer.tsx',
        'src/components/blocks/HeroCenteredBlock.tsx',
        'src/components/blocks/FeatureGridBlock.tsx',
        'src/components/blocks/PropertyShowcaseBlock.tsx',
        'src/components/blocks/ContactFormBlock.tsx',
        'src/components/blocks/BookingSearchBlock.tsx'
    ]

    missing = []
    for f in required_files:
        if not os.path.exists(os.path.join('/app', f)):
            missing.append(f)

    if missing:
        print(f"FAILED: Missing files: {', '.join(missing)}")
        sys.exit(1)

    print("SUCCESS: All core CMS components exist.")

if __name__ == "__main__":
    verify()
