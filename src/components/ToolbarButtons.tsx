import { Button, DropdownMenu, Flex } from '@radix-ui/themes';

interface ToolbarButtonsProps {
  onDeploy: () => void;
  onDownload: () => void;
  onReset: () => void;
  onLogout: () => void;
  sqlScript: string | null;
}

export const ToolbarButtons = ({
  onDeploy,
  onDownload,
  onReset,
  onLogout,
  sqlScript
}: ToolbarButtonsProps) => {
  return (
    <div className="tabs-right flex items-center gap-4">
      <Button 
        onClick={onDeploy}
        variant="ghost" 
        className="text-gray-400 hover:text-white flex items-center gap-2"
        disabled={!sqlScript}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        </svg>
        Deploy
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button 
            variant="ghost" 
            size="2"
            style={{ 
              padding: '8px',
              color: '#888',
              cursor: 'pointer',
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="currentColor"
              style={{ transform: 'rotate(90deg)' }}
            >
              <path d="M8 2a1 1 0 110-2 1 1 0 010 2zM8 9a1 1 0 110-2 1 1 0 010 2zM8 16a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={onDownload} disabled={!sqlScript}>
            <Flex gap="2" align="center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
              </svg>
              Download SQL
            </Flex>
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" onClick={onReset}>
            <Flex gap="2" align="center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Reset All
            </Flex>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Button 
        onClick={onLogout}
        variant="ghost" 
        className="text-gray-400 hover:text-white flex items-center gap-2"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </Button>
    </div>
  );
}; 