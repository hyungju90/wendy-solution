import { createClient } from '@supabase/supabase-js';

// 환경 변수 에러를 방지하기 위해 수파베이스 고유 주소와 키를 직접 세팅합니다.
const supabaseUrl = 'https://jrinzjtffkngxmkdoyjc.supabase.co';
const supabaseAnonKey = 'sb_publishable_tCdhQlD9xVUkntd02yw_Bg_NF-b4DyA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);