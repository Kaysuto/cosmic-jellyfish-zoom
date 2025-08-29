const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = "https://tgffkwoekuaetahrwioo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('💡 Please set it with: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function confirmAdminEmail() {
  try {
    console.log('🔍 Fetching users...');
    
    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    console.log(`📊 Found ${users.users.length} users`);
    
    // Afficher tous les utilisateurs
    users.users.forEach(user => {
      console.log(`👤 ${user.email} - Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);
    });

    // Demander l'email à confirmer
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('📧 Enter the email to confirm: ', async (email) => {
      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        console.error('❌ User not found');
        rl.close();
        return;
      }

      console.log(`🔧 Confirming email for: ${user.email}`);
      
      // Confirmer l'email
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirmed_at: new Date().toISOString(),
        email_confirm: true,
      });

      if (error) {
        console.error('❌ Error confirming email:', error);
      } else {
        console.log('✅ Email confirmed successfully!');
        console.log(`👤 User: ${data.user.email}`);
        console.log(`📅 Confirmed at: ${data.user.email_confirmed_at}`);
      }

      rl.close();
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

confirmAdminEmail();
