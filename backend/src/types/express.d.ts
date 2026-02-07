declare namespace Express {
  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    password?: string;
    google_id?: string;
    created_at: Date;
    updated_at: Date;
  }
}
