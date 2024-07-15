
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateContactModal from '@/app/components/CreateContactModal';
import { fetchApi } from '@/app/utils/api';

jest.mock('@/app/utils/api');

describe('CreateContactModal', () => {
  const onCreateContact = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    render(
      <CreateContactModal
        isOpen={true}
        onClose={onClose}
        onCreateContact={onCreateContact}
      />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate form inputs', () => {
    const idInput = screen.getByLabelText(/ID/i);
    fireEvent.change(idInput, { target: { value: 'abc' } });
    fireEvent.blur(idInput);
    expect(screen.getByText('ID must be a number')).toBeInTheDocument();
 
    const firstNameInput = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'John123' } });
    fireEvent.blur(firstNameInput);
    expect(screen.getByText('First name must contain only alphabetic characters and spaces')).toBeInTheDocument();
 
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    fireEvent.change(lastNameInput, { target: { value: 'Doe123' } });
    fireEvent.blur(lastNameInput);
    expect(screen.getByText('Last name must contain only alphabetic characters and spaces')).toBeInTheDocument();
 
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalidEmail' } });
    fireEvent.blur(emailInput);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
 
    const phoneInput = screen.getByLabelText(/Phone/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);
    expect(screen.getByText('Phone number must be 10 digits')).toBeInTheDocument();
  });

  it('should update values on input change', () => {
    const firstNameInput = screen.getByLabelText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    expect(firstNameInput.value).toBe('John');

    const lastNameInput = screen.getByLabelText(/Last Name/i);
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    expect(lastNameInput.value).toBe('Doe');

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    expect(emailInput.value).toBe('john.doe@example.com');

    const phoneInput = screen.getByLabelText(/Phone/i);
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  it('should submit the form with valid data', async () => {
    fetchApi.mockResolvedValue({ id: 1, FirstName: 'John', LastName: 'Doe', Email: 'john.doe@example.com', Phone: '1234567890' });

    fireEvent.change(screen.getByLabelText(/ID/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(fetchApi).toHaveBeenCalledWith('/contact', {
        method: 'POST',
        body: JSON.stringify({
          id: 1,
          FirstName: 'John',
          LastName: 'Doe',
          Email: 'john.doe@example.com',
          Phone: '1234567890'
        }),
      });
      expect(onCreateContact).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should not submit the form with invalid data', async () => {
  const idInput = screen.getByLabelText(/ID/i);
  fireEvent.change(idInput, { target: { value: 'abc' } });
  
  const createButton = screen.getByText('Create');
  fireEvent.click(createButton);

  await waitFor(() => {
    expect(fetchApi).not.toHaveBeenCalled();
    expect(onCreateContact).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('ID must be a number')).toBeInTheDocument();
  });
});

  it('should display a loading spinner while submitting', async () => {
    fetchApi.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({}), 1000)));

    fireEvent.change(screen.getByLabelText(/ID/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);

    expect(createButton).toHaveAttribute('data-loading');

    await waitFor(() => {
      expect(createButton).toHaveAttribute('data-loading');
    });
  });
  
  it('should handle API errors', async () => {
    fetchApi.mockRejectedValue(new Error('API Error'));
    console.error = jest.fn();

    fireEvent.change(screen.getByLabelText(/ID/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Create contact error:', expect.any(Error));
      expect(onCreateContact).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
