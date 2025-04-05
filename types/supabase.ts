export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_logs: {
        Row: {
          agent_type: string | null
          created_at: string
          error_message: string | null
          id: string
          input: Json | null
          output: Json | null
          processing_time: number | null
          session_id: string | null
        }
        Insert: {
          agent_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          processing_time?: number | null
          session_id?: string | null
        }
        Update: {
          agent_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input?: Json | null
          output?: Json | null
          processing_time?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          session_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          answer_id: string
          clarity_score: number | null
          created_at: string
          feedback: string
          id: string
          improvement_suggestions: string | null
          overall_score: number | null
          relevance_score: number | null
        }
        Insert: {
          answer_id: string
          clarity_score?: number | null
          created_at?: string
          feedback: string
          id?: string
          improvement_suggestions?: string | null
          overall_score?: number | null
          relevance_score?: number | null
        }
        Update: {
          answer_id?: string
          clarity_score?: number | null
          created_at?: string
          feedback?: string
          id?: string
          improvement_suggestions?: string | null
          overall_score?: number | null
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "user_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          created_at: string
          id: string
          question_order: number
          question_text: string
          question_type: string | null
          related_skill: string | null
          session_id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          question_order: number
          question_text: string
          question_type?: string | null
          related_skill?: string | null
          session_id: string
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          question_order?: number
          question_text?: string
          question_type?: string | null
          related_skill?: string | null
          session_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          created_at: string
          id: string
          job_posting_id: string
          profile_id: string
          resume_id: string
          status: string | null
          strategy: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_posting_id: string
          profile_id: string
          resume_id: string
          status?: string | null
          strategy?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_posting_id?: string
          profile_id?: string
          resume_id?: string
          status?: string | null
          strategy?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean | null
          parsed_requirements: Json | null
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean | null
          parsed_requirements?: Json | null
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean | null
          parsed_requirements?: Json | null
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_anonymous: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_anonymous?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_anonymous?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content: string
          created_at: string
          education: Json | null
          experience: Json | null
          id: string
          is_active: boolean | null
          parsed_skills: Json | null
          profile_id: string
          projects: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: string
          is_active?: boolean | null
          parsed_skills?: Json | null
          profile_id: string
          projects?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: string
          is_active?: boolean | null
          parsed_skills?: Json | null
          profile_id?: string
          projects?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_answers: {
        Row: {
          answer_text: string
          created_at: string
          id: string
          question_id: string
          voice_recording_url: string | null
        }
        Insert: {
          answer_text: string
          created_at?: string
          id?: string
          question_id: string
          voice_recording_url?: string | null
        }
        Update: {
          answer_text?: string
          created_at?: string
          id?: string
          question_id?: string
          voice_recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_anonymous_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
