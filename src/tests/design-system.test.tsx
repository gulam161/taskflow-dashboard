import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { toast, ToastContainer } from '@/components/ui/Toast';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';

describe('Design System Components', () => {
  describe('Button', () => {
    it('renders with children and handles click', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);

      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders loading state and disables button', () => {
      render(<Button isLoading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(<Button variant="danger">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-red-600');

      rerender(<Button variant="outline">Cancel</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-transparent');
    });
  });

  describe('Input', () => {
    it('renders with label and handles change', () => {
      const handleChange = vi.fn();
      render(<Input label="Task Title" onChange={handleChange} placeholder="Enter title" />);

      expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
      const input = screen.getByPlaceholderText(/enter title/i);

      fireEvent.change(input, { target: { value: 'New Task' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message and sets aria-invalid', () => {
      render(<Input label="Email" error="Email is required" />);
      const input = screen.getByLabelText(/email/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  describe('Select', () => {
    it('renders options and handles selection', () => {
      const handleChange = vi.fn();
      const options = [
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ];

      render(<Select label="Priority" options={options} onChange={handleChange} />);
      const select = screen.getByLabelText(/priority/i);
      expect(select).toBeInTheDocument();

      fireEvent.change(select, { target: { value: 'high' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Modal', () => {
    it('renders modal when isOpen is true and handles close', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Confirm Action">
          <p>Are you sure?</p>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
          <p>Hidden</p>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Toast', () => {
    it('displays toast message when triggered and dismisses', () => {
      render(<ToastContainer />);

      act(() => {
        toast('Task saved successfully!', 'success');
      });

      expect(screen.getByText('Task saved successfully!')).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
      fireEvent.click(dismissBtn);

      expect(screen.queryByText('Task saved successfully!')).not.toBeInTheDocument();
    });
  });

  describe('DataTable', () => {
    interface Item {
      id: number;
      name: string;
      role: string;
    }

    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
    ];

    const data: Item[] = [
      { id: 1, name: 'Alice', role: 'Engineer' },
      { id: 2, name: 'Bob', role: 'Designer' },
    ];

    it('renders table headers and row items', () => {
      render(
        <DataTable<Item>
          columns={columns}
          data={data}
          rowKey={(row) => row.id}
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('displays emptyMessage when no data is passed', () => {
      render(
        <DataTable<Item>
          columns={columns}
          data={[]}
          rowKey={(row) => row.id}
          emptyMessage="No users found"
        />
      );

      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders skeleton element with correct aria attributes', () => {
      render(<Skeleton variant="rectangular" width="200px" height="40px" />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
