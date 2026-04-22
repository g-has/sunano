import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      peripherals: {
        Row: {
          id: string
          name: string
          brand: string
          category: "keyboard" | "mouse" | "mousepad" | "glasspad" | "iem" | "headset"
          tier: "T0" | "T0.5" | "T1" | "T2"
          price: number
          image_url: string | null
          created_at: string
          updated_at: string
          specs: Record<string, unknown>
          tags: ("competitive" | "versatile" | "value" | "comfort")[]
        }
        Insert: Omit<Database["public"]["Tables"]["peripherals"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["peripherals"]["Insert"]>
      }
      blog_posts: {
        Row: {
          id: string
          peripheral_id: string
          author_id: string | null
          title: string
          slug: string
          excerpt: string | null
          cover_image_url: string | null
          cover_thumbnail_url: string | null
          read_time_minutes: number
          video_url: string | null
          content: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>
      }
      admin_profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          role: "admin" | "webmaster"
          permissions: Record<string, boolean>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["admin_profiles"]["Row"], "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>
      }
    }
  }
}
