import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import SupabaseIcon from './icons/SupabaseIcon';

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
  const buttonStyles = "text-gray-400 hover:text-white flex items-center gap-2 border border-[rgb(34,255,158,0.3)] rounded-full px-3 py-1 cursor-pointer transition-all duration-300 hover:border-[rgb(34,255,158,0.5)] hover:bg-black/20 hover:shadow-[0_0_8px_rgba(34,255,158,0.3),inset_0_0_2px_rgba(34,255,158,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[rgb(34,255,158,0.3)] disabled:hover:bg-transparent";

  return (
    <div className="tabs-right flex items-center gap-4">
      <Button 
        onClick={onDeploy}
        variant="ghost" 
        className={buttonStyles}
        disabled={!sqlScript}
      >
        <SupabaseIcon className="w-4 h-4" />
        Deploy to Supabase
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button 
            variant="ghost" 
            className={`${buttonStyles} !px-2 !py-1`}
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
        className={buttonStyles}
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