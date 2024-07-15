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
  Input,
  Box,
  Text,
  Flex,
  Avatar,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { fetchApi } from '../utils/api';

export default function EditContactModal({ isOpen, onClose, contact, onUpdateContact }) {
  const [editedContact, setEditedContact] = useState({
    id: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    PictureUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setEditedContact(contact);
      validateForm();
    }
  }, [contact]);

  const validateForm = () => {
    const newErrors = {
      FirstName: '',
      LastName: '',
      Email: '',
      Phone: '',
    };

    if (editedContact.FirstName && !/^[A-Za-z\s]+$/.test(editedContact.FirstName)) {
      newErrors.FirstName = 'First name must contain only alphabetic characters and spaces';
    }

    if (editedContact.LastName && !/^[A-Za-z\s]+$/.test(editedContact.LastName)) {
      newErrors.LastName = 'Last name must contain only alphabetic characters and spaces';
    }

    if (editedContact.Email && !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(editedContact.Email)) {
      newErrors.Email = 'Please enter a valid email address';
    }

    if (editedContact.Phone && !/^\d{10}$/.test(editedContact.Phone)) {
      newErrors.Phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleChange = (e) => {
    setEditedContact({ ...editedContact, [e.target.name]: e.target.value });
    validateForm();
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedContact({ ...editedContact, PictureUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setEditedContact({ ...editedContact, PictureUrl: '' });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchApi(`/contact/${editedContact.id}`, {
        method: 'PUT',
        body: JSON.stringify(editedContact),
      });
      onUpdateContact(response);
      onClose();
    } catch (error) {
      console.error('Error updating contact:', error);
      // Handle error (e.g., show error message)
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
        <ModalHeader>Edit Contact</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" alignItems="center">
            <Box mb="10px" position="relative">
              <Avatar
                size="2xl"
                src={editedContact?.PictureUrl || ''}
                name={`${editedContact?.FirstName || ''} ${editedContact?.LastName || ''}`}
              />
              <Box
                position="absolute"
                bottom="0"
                right="0"
                backgroundColor="gray.100"
                borderRadius="full"
                cursor="pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                <IconButton
                  icon={<AddIcon />}
                  borderRadius="full"
                  colorScheme="teal"
                  aria-label="Upload Picture"
                />
                <Input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  display="none"
                />
              </Box>
            </Box>
            {editedContact?.PictureUrl && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleRemovePicture}
              >
                Remove Picture
              </Button>
            )}
          </Flex>
              <Box mb="20px">
              <Input
                placeholder="First Name"
                value={editedContact.FirstName}
                onChange={(e) => {
                  setEditedContact({ ...editedContact, FirstName: e.target.value });
                  validateForm();
                }}
                isInvalid={!!errors.FirstName}
                errorBorderColor="red.500"
              />
              {errors.FirstName && <Text color="red.500">{errors.FirstName}</Text>}
            </Box>
            <Box mb="20px">
              <Input
                placeholder="Last Name"
                value={editedContact.LastName}
                onChange={(e) => {
                  setEditedContact({ ...editedContact, LastName: e.target.value });
                  validateForm();
                }}
                isInvalid={!!errors.LastName}
                errorBorderColor="red.500"
              />
              {errors.LastName && <Text color="red.500">{errors.LastName}</Text>}
            </Box>
            <Box mb="20px">
              <Input
                placeholder="Email"
                value={editedContact.Email}
                onChange={(e) => {
                  setEditedContact({ ...editedContact, Email: e.target.value });
                  validateForm();
                }}
                isInvalid={!!errors.Email}
                errorBorderColor="red.500"
              />
              {errors.Email && <Text color="red.500">{errors.Email}</Text>}
            </Box>
            <Box mb="20px">
              <Input
                placeholder="Phone"
                value={editedContact.Phone}
                onChange={(e) => {
                  setEditedContact({ ...editedContact, Phone: e.target.value });
                  validateForm();
                }}
                isInvalid={!!errors.Phone}
                errorBorderColor="red.500"
              />
              {errors.Phone && <Text color="red.500">{errors.Phone}</Text>}
            </Box>
            </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} isLoading={isLoading} mr={3}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}