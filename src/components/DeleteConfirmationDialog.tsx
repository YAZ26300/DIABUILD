import { Dialog, Button, Flex, Text } from '@radix-ui/themes';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm }: DeleteConfirmationDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] rounded-lg bg-[#1E1E1E] border border-[#333] p-6">
        <Dialog.Title className="text-lg font-semibold mb-4 text-white">
          Reset Application
        </Dialog.Title>
        
        <Dialog.Description className="text-[#D4D4D4] mb-6">
          Are you sure you want to reset everything? This will clear all data and reload the page.
        </Dialog.Description>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button 
              variant="soft" 
              color="gray"
              className="hover:bg-[#333]"
            >
              Cancel
            </Button>
          </Dialog.Close>
          <Button 
            variant="solid" 
            color="red" 
            onClick={onConfirm}
            className="hover:bg-red-600"
          >
            Reset All
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default DeleteConfirmationDialog; 