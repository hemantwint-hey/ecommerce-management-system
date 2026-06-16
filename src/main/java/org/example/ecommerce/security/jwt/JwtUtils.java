package org.example.ecommerce.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.example.ecommerce.security.services.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);
    @Value("${spring.app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;
    @Value("${spring.app.jwtSecret:ZGV2LWp3dC1zZWNyZXQta2V5LWZvci1sb2NhbC11c2Utb25seS0xMjM0NTY3ODkw}")
    private String jwtSecret;

    @Value("${spring.app.jwtCookieName:springBootEcom}")
    private String jwtCookie;

    public String getJwtFromCookies(HttpServletRequest request){
        Cookie cookie = WebUtils.getCookie(request,jwtCookie);
        if (cookie != null){
            return cookie.getValue();
        }
        else return null;
    }

    // Getting JWT From Username
    public String generateTokenFromUsername(String username){

         return Jwts.builder()
                 .subject(username)
                 .issuedAt(new Date())
                 .expiration(new Date((new Date().getTime() + jwtExpirationMs)))
                 .signWith(key())
                 .compact();
    }

    public ResponseCookie generateJwtCookie(UserDetailsImpl userPrincipal){
        String jwt = generateTokenFromUsername(userPrincipal.getUsername());
        ResponseCookie cookie = ResponseCookie.from(jwtCookie, jwt)
                .path("/api")
                .maxAge(24*60*60)
                .httpOnly(true)
                .build();
        return cookie;
    }

    public ResponseCookie getCleanJwtCookie(){
        ResponseCookie cookie = ResponseCookie.from(jwtCookie, null)
                .path("/api")
                .build();
        return cookie;
    }

    // Getting Username from JWT Token
    public String getUserNameFromJWTToken(String token){
        return  Jwts.parser()
                .verifyWith(key())
                .build().parseSignedClaims(token)
                .getPayload().getSubject();
    }
    // Getting Signing  Key
    public SecretKey key(){
        return Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(jwtSecret)
        );
    }

    // Validate JWT Token
    public boolean validateJwtToken(String authToken){
        try{
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch(MalformedJwtException exception){
            logger.error("Invalid JWT token: {}",exception.getMessage());
        }
        catch(ExpiredJwtException exception){
            logger.error("JWT token is expired: {}",exception.getMessage());
        }
        catch(UnsupportedJwtException exception){
            logger.error("JWT token is unsupported: {}",exception.getMessage());
        }
        catch(SignatureException exception){
            logger.error("JWT signature is invalid: {}", exception.getMessage());
        }
        catch(IllegalArgumentException exception){
            logger.error("JWT claims string is empty: {}",exception.getMessage());
        }
        return false;
    }
}
