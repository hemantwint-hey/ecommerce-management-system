package org.example.ecommerce.controller;

import org.example.ecommerce.payload.UserDTO;
import org.example.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{userId}/roles")
    public ResponseEntity<UserDTO> updateUserRoles(@PathVariable Long userId, @RequestBody Set<String> roles){
        return ResponseEntity.ok(userService.updateUserRoles(userId, roles));
    }
}
