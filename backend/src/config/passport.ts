import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { config } from './index';
import { pgPool } from '../database/postgres';
import { User } from '../types';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret,
    },
    async (payload, done) => {
      try {
        const result = await pgPool.query<User>(
          'SELECT id, email, name, avatar FROM users WHERE id = $1',
          [payload.userId]
        );
        
        if (result.rows.length === 0) {
          return done(null, false);
        }
        
        return done(null, result.rows[0]);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth2 Strategy
if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          const existingUser = await pgPool.query<User>(
            'SELECT * FROM users WHERE google_id = $1 OR email = $2',
            [profile.id, profile.emails?.[0]?.value]
          );
          
          if (existingUser.rows.length > 0) {
            const user = existingUser.rows[0];
            
            // Update google_id if not set
            if (!user.google_id) {
              await pgPool.query(
                'UPDATE users SET google_id = $1, avatar = $2 WHERE id = $3',
                [profile.id, profile.photos?.[0]?.value, user.id]
              );
            }
            
            return done(null, user);
          }
          
          // Create new user
          const result = await pgPool.query<User>(
            `INSERT INTO users (email, name, google_id, avatar)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
              profile.emails?.[0]?.value,
              profile.displayName,
              profile.id,
              profile.photos?.[0]?.value,
            ]
          );
          
          return done(null, result.rows[0]);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;
