import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Table from '../../components/common/Table';

describe('Table Component', () => {
  const mockColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
  ];

  const mockData = [
    { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  it('should render table with headers and data', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should display "No data to display" when data is empty', () => {
    render(<Table columns={mockColumns} data={[]} />);
    
    expect(screen.getByText('No data to display.')).toBeInTheDocument();
  });

  it('should display "No data to display" when data is null', () => {
    render(<Table columns={mockColumns} data={null} />);
    
    expect(screen.getByText('No data to display.')).toBeInTheDocument();
  });

  it('should display "N/A" for missing data fields', () => {
    const incompleteData = [
      { _id: '1', name: 'John Doe', email: 'john@example.com' }, // missing role
    ];
    
    render(<Table columns={mockColumns} data={incompleteData} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should render actions column when renderActions is provided', () => {
    const mockRenderActions = vi.fn((row) => (
      <button key={row._id}>Edit {row.name}</button>
    ));
    
    render(<Table columns={mockColumns} data={mockData} renderActions={mockRenderActions} />);
    
    expect(screen.getByText('Edit John Doe')).toBeInTheDocument();
    expect(screen.getByText('Edit Jane Smith')).toBeInTheDocument();
    expect(mockRenderActions).toHaveBeenCalledTimes(2);
  });

  it('should not render actions column when renderActions is not provided', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    // Should not have any action buttons
    expect(screen.queryByText(/Edit/)).not.toBeInTheDocument();
  });

  it('should handle data without _id field', () => {
    const dataWithoutId = [
      { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    ];
    
    render(<Table columns={mockColumns} data={dataWithoutId} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render table with proper CSS classes', () => {
    const { container } = render(<Table columns={mockColumns} data={mockData} />);
    
    const table = container.querySelector('table');
    expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200');
    
    const thead = container.querySelector('thead');
    expect(thead).toHaveClass('bg-gray-50');
    
    const tbody = container.querySelector('tbody');
    expect(tbody).toHaveClass('bg-white', 'divide-y', 'divide-gray-200');
  });

  it('should render table rows with hover effect', () => {
    const { container } = render(<Table columns={mockColumns} data={mockData} />);
    
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
      expect(row).toHaveClass('transition-colors', 'hover:bg-gray-50');
    });
  });
}); 