package org.example.ecommerce.service;

import org.example.ecommerce.model.Address;
import org.example.ecommerce.model.User;
import org.example.ecommerce.payload.AddressDTO;
import org.example.ecommerce.repositories.AddressRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ModelMapper modelMapper;



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
}
