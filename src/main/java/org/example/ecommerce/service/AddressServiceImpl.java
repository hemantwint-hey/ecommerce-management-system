package org.example.ecommerce.service;

import org.example.ecommerce.exceptions.ResourceNotFoundException;
import org.example.ecommerce.model.Address;
import org.example.ecommerce.model.User;
import org.example.ecommerce.payload.AddressDTO;
import org.example.ecommerce.repositories.AddressRepository;
import org.example.ecommerce.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    UserRepository userRepository;



    @Override
    public AddressDTO createAddress(AddressDTO addressDTO, User user) {
        Address address = modelMapper.map(addressDTO, Address.class);
        List<Address> addressList = user.getAddresses();
        addressList.add(address);
        user.setAddresses(addressList);

        address.setUser(user);
        Address savedAddress = addressRepository.save(address);

        return modelMapper.map(savedAddress, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getAddresses() {
        List<Address> addresses = addressRepository.findAll();
        List<AddressDTO> adrressDTOs = addresses.stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .toList();
        return adrressDTOs;
    }

    @Override
    public AddressDTO getAddressesById(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address","addressId",addressId));
        return modelMapper.map(address,AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getUserAddress(User user) {
        List<Address> addresses = user.getAddresses();
        return addresses.stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .toList();
    }

    @Override
    public AddressDTO updateAddress(Long addressId, AddressDTO addressDTO) {
        Address addressFromDatabase = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address","addressId",addressId));

        addressFromDatabase.setCity(addressDTO.getCity());
        addressFromDatabase.setCity(addressDTO.getPincode());
        addressFromDatabase.setCity(addressDTO.getState());
        addressFromDatabase.setCity(addressDTO.getCountry());
        addressFromDatabase.setCity(addressDTO.getStreet());
        addressFromDatabase.setCity(addressDTO.getBuildingName());

        Address updatedAddress = addressRepository.save(addressFromDatabase);
        User user = addressFromDatabase.getUser();
        user.getAddresses().removeIf(address -> address.getAddressId().equals(addressId));
        user.getAddresses().add(updatedAddress);

        userRepository.save(user);
        return modelMapper.map(updatedAddress, AddressDTO.class);
    }

    @Override
    public String deleteAddress(Long addressId) {
        Address addressFromDatabase = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address","addressId",addressId));
        User user = addressFromDatabase.getUser();
        user.getAddresses().removeIf(address -> address.getAddressId().equals(addressId));
        userRepository.save(user);
        addressRepository.delete(addressFromDatabase);
        return "Address deleted successfully with addressId"+addressId;
    }
}
