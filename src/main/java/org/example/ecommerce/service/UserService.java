package org.example.ecommerce.service;

import org.example.ecommerce.payload.UserDTO;

import java.util.List;
import java.util.Set;

public interface UserService {
    List<UserDTO> getAllUsers();

    UserDTO updateUserRoles(Long userId, Set<String> roleNames);
}
