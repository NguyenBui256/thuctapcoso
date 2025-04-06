package edu.ptit.ttcs.service.redis;

import edu.ptit.ttcs.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtRedisService{

    private final RedisTemplate<String, String> redisTemplate;

    private final JwtService jwtService;

    private final String REFRESH_TOKEN_ID_NAME = "refresh_token_id";

    public boolean isRefreshTokenValid(String username, String token) {
        String tokenId = jwtService.extractId(token);
        try{
            String curTokenId = (String)redisTemplate.opsForHash().get(username, REFRESH_TOKEN_ID_NAME);
            return tokenId.equals(curTokenId);
        }
        catch (Exception e){
            log.info("Redis isn't working");
            return false;
        }
    }

    public void setNewRefreshToken(String username, String token) {
        String tokenId = jwtService.extractId(token);
        try{
            redisTemplate.opsForHash().put(username, REFRESH_TOKEN_ID_NAME, tokenId);
        }
        catch (Exception e){
            log.info("Redis isn't working");
        }
    }

    public void deleteRefreshToken(String username) {
        try{
            redisTemplate.opsForHash().delete(username, REFRESH_TOKEN_ID_NAME);
        }
        catch (Exception e){
            log.info("Redis isn't working");
        }
    }


}
