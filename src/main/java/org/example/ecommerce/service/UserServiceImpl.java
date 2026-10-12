package org.example.ecommerce.service;

import org.example.ecommerce.exceptions.APIException;
import org.example.ecommerce.exceptions.ResourceNotFoundException;
import org.example.ecommerce.model.AppRole;
import org.example.ecommerce.model.Role;
import org.example.ecommerce.model.User;
import org.example.ecommerce.payload.UserDTO;
import org.example.ecommerce.repositories.RoleRepository;
import org.example.ecommerce.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserToDTO)
                .toList();
    }

    @Override
    public UserDTO updateUserRoles(Long userId, Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new APIException("A user must have at least one role");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        Set<Role> roles = roleNames.stream()
                .map(roleName -> {
                    AppRole appRole;
                    try {
                        appRole = AppRole.valueOf(roleName);
                    } catch (IllegalArgumentException e) {
                        throw new APIException("Invalid role: " + roleName);
                    }
                    return roleRepository.findByRoleName(appRole)
                            .orElseThrow(() -> new APIException("Role not found: " + roleName));
                })
                .collect(Collectors.toSet());

        user.setRoles(roles);
        User savedUser = userRepository.save(user);
        return mapUserToDTO(savedUser);
    }

    private UserDTO mapUserToDTO(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toSet());
        return new UserDTO(user.getUserId(), user.getUserName(), user.getEmail(), roles);
    }
}
