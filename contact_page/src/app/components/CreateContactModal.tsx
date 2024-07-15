import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { fetchApi } from '../utils/api';

export default function CreateContactModal({ isOpen, onClose, onCreateContact }) {
  const [contact, setContact] = useState({
    id: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    validateForm();
  }, [contact]);

  const validateForm = () => {
    const newErrors = {
        id: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: ''
      };
  
      if (contact.id && !/^\d+$/.test(contact.id)) {
        newErrors.id = 'ID must be a number';
      }
  
      if (contact.FirstName && !/^[A-Za-z\s]*$/.test(contact.FirstName)) {
        newErrors.FirstName = 'First name must contain only alphabetic characters and spaces';
      }
  
      if (contact.LastName && !/^[A-Za-z\s]*$/.test(contact.LastName)) {
        newErrors.LastName = 'Last name must contain only alphabetic characters and spaces';
      }
  
      if (contact.Email && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(contact.Email)) {
        newErrors.Email = 'Please enter a valid email address';
      }
  
      if (contact.Phone && !/^\d{10}$/.test(contact.Phone)) {
        newErrors.Phone = 'Phone number must be 10 digits';
      }
  
      setErrors(newErrors);
    };

  const handleChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(errors).some(error => error !== '')) {
      return;
    }
    setIsLoading(true);
  
    try {
      const contactToSend = {
        ...contact,
        id: contact.id ? parseInt(contact.id, 10) : undefined,
      };
  
      const newContact = await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(contactToSend),
      });
      await onCreateContact(newContact); // Pass the newContact received from the API
      onClose();
    } catch (error) {
      console.error('Create contact error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent position="relative">
        {isLoading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            backgroundColor="rgba(255, 255, 255, 0.8)"
            zIndex="1"
          >
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl'
            />
          </Box>
        )}
        <ModalHeader>Create New Contact</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              id="id"
              name="id"
              value={contact.id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              id="FirstName"
              name="FirstName"
              value={contact.FirstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.FirstName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {errors.FirstName && <p className="text-red-500 text-xs mt-1">{errors.FirstName}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="LastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              id="LastName"
              name="LastName"
              value={contact.LastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.LastName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {errors.LastName && <p className="text-red-500 text-xs mt-1">{errors.LastName}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={contact.Email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.Email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="Phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              id="Phone"
              name="Phone"
              value={contact.Phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.Phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {errors.Phone && <p className="text-red-500 text-xs mt-1">{errors.Phone}</p>}
          </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit} isLoading={isLoading}>
            Create
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}