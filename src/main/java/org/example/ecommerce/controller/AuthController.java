package org.example.ecommerce.controller;

import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.example.ecommerce.model.AppRole;
import org.example.ecommerce.model.Role;
import org.example.ecommerce.model.User;
import org.example.ecommerce.repositories.RoleRepository;
import org.example.ecommerce.repositories.UserRepository;
import org.example.ecommerce.security.MessageResponse;
import org.example.ecommerce.security.SignupRequest;
import org.example.ecommerce.security.jwt.JwtUtils;
import org.example.ecommerce.security.jwt.LoginRequest;
import org.example.ecommerce.security.jwt.UserInfoResponse;
import org.example.ecommerce.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    @Autowired
    private final JwtUtils jwtUtils;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;
    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    @Autowired
    RoleRepository roleRepository;

    @PostMapping("/signin")
    public ResponseEntity<UserInfoResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwt = jwtUtils.generateTokenFromUsername(userDetails.getUsername());
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(new UserInfoResponse(userDetails.getId(), jwt, userDetails.getUsername(), roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registereUser(@Valid @RequestBody  SignupRequest signupRequest){
        if(userRepository.existsByUserName(signupRequest.getUsername())){
            return ResponseEntity.badRequest().body(new MessageResponse("Error: username is already taken!"));
        }
        if(userRepository.existsByEmail(signupRequest.getEmail())){
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already takem!"));
        }
        User user = new User(
                signupRequest.getUsername(),
                signupRequest.getEmail(),
                encoder.encode(signupRequest.getPassword())
        );

        Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found"));
        Set<Role> roles = Set.of(userRole);
        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User Registered successfull"));
    }
    @GetMapping("/username")
    public String currentUserName(Authentication authentication){
        if(authentication !=null)return authentication.getName();
        else return "NULL";
    }

    @GetMapping("/user")
    public ResponseEntity<UserInfoResponse> getUserDetails(Authentication authentication){
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(401).build();
        }

        String jwt = jwtUtils.generateTokenFromUsername(userDetails.getUsername());
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(new UserInfoResponse(userDetails.getId(), jwt, userDetails.getUsername(), roles));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> signoutUser(){
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie.toString())
                .body(new MessageResponse("You have been signed out!"));
    }
}
