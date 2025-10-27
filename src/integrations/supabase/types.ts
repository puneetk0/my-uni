export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_date: string;
          created_at: string;
          description: string;
          id: string;
          is_featured: boolean;
          media_url: string | null;
          status: string;
          tags: string[] | null;
          title: string;
          type: string;
          user_id: string;
          verified_by: string | null;
          how_it_started: string | null;
          how_we_built_it: string | null;
          what_we_achieved: string | null;
          what_we_learned: string | null;
          upvotes: number;
          photos: string[] | null;
        };
        Insert: {
          achievement_date: string;
          created_at?: string;
          description: string;
          id?: string;
          is_featured?: boolean;
          media_url?: string | null;
          status?: string;
          tags?: string[] | null;
          title: string;
          type: string;
          user_id: string;
          verified_by?: string | null;
          how_it_started?: string | null;
          how_we_built_it?: string | null;
          what_we_achieved?: string | null;
          what_we_learned?: string | null;
          upvotes?: number;
          photos?: string[] | null;
        };
        Update: {
          achievement_date?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_featured?: boolean;
          media_url?: string | null;
          status?: string;
          tags?: string[] | null;
          title?: string;
          type?: string;
          user_id?: string;
          verified_by?: string | null;
          how_it_started?: string | null;
          how_we_built_it?: string | null;
          what_we_achieved?: string | null;
          what_we_learned?: string | null;
          upvotes?: number;
          photos?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievements_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      achievement_teams: {
        Row: {
          id: string;
          achievement_id: string;
          user_id: string;
          role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          achievement_id: string;
          user_id: string;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          achievement_id?: string;
          user_id?: string;
          role?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievement_teams_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievement_teams_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      achievement_comments: {
        Row: {
          id: number;
          achievement_id: string;
          user_id: string;
          body: string;
          parent_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          achievement_id: string;
          user_id: string;
          body: string;
          parent_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          achievement_id?: string;
          user_id?: string;
          body?: string;
          parent_id?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievement_comments_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievement_comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "achievement_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievement_comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievement_comments_user_id_fkey_profiles";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      achievement_upvotes: {
        Row: {
          achievement_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          achievement_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          achievement_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievement_upvotes_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievement_upvotes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      achievement_photos: {
        Row: {
          id: number;
          achievement_id: string;
          storage_path: string;
          public_url: string;
          sort_index: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          achievement_id: string;
          storage_path: string;
          public_url: string;
          sort_index?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          achievement_id?: string;
          storage_path?: string;
          public_url?: string;
          sort_index?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievement_photos_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
        ];
      };
      achievement_teammates: {
        Row: {
          achievement_id: string;
          user_id: string;
          role: string | null;
          created_at: string;
        };
        Insert: {
          achievement_id: string;
          user_id: string;
          role?: string | null;
          created_at?: string;
        };
        Update: {
          achievement_id?: string;
          user_id?: string;
          role?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievement_teammates_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "achievement_teammates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunities: {
        Row: {
          created_at: string;
          created_by: string;
          description: string;
          id: number;
          is_approved: boolean;
          title: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          description: string;
          id?: number;
          is_approved?: boolean;
          title: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          description?: string;
          id?: number;
          is_approved?: boolean;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_created_by_fkey_profiles";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          id: string;
          updated_at: string | null;
          website: string | null;
          department: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          id: string;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          id?: string;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<TableName extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][TableName]["Row"];

export type Enums<EnumName extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][EnumName];

