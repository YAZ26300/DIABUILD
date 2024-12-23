import { Button, DropdownMenu, Flex, Text } from '@radix-ui/themes';

interface HeaderProps {
  onDownload: () => void;
  onReset: () => void;
  hasSQL: boolean;
}

const Header = ({ onDownload, onReset, hasSQL }: HeaderProps) => {
  return (
    <Flex justify="between" align="center" px="4" py="3" style={{ borderBottom: '1px solid #333' }}>
      <Text size="5" weight="bold" style={{ color: 'white' }}>
      FlowMindAI
      </Text>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button 
            variant="ghost" 
            size="2"
            style={{ 
              padding: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
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
          <DropdownMenu.Item onClick={onDownload} disabled={!hasSQL}>
            <Flex gap="2" align="center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
              </svg>
              Download SQL
            </Flex>
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={onReset} color="red">
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
    </Flex>
  );
};

export default Header; 