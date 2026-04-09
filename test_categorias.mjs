import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ednfywcgvrolnqulwwco.supabase.co',
  'sb_publishable_dXQT6ye6XiF7XD2_zkMbJA_5RwE0DfE'
);

async function checkCategorias() {
  const { data, error } = await supabase.from('categorias').select('*');
  console.log('Error:', error);
  console.log('Data:', data);
}

checkCategorias();
