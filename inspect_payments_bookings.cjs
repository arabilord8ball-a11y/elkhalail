const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnbxqluepeakokvcywry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuYnhxbHVlcGVha29rdmN5d3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTUzNzMsImV4cCI6MjA5ODY5MTM3M30.oA-0CpaQ7-eugpBnDcizgf1q7ICNQtDk9m531TixuGI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: bookings } = await supabase.from('bookings').select('*');
  const { data: payments } = await supabase.from('payments').select('*');

  console.log("=== BOOKINGS ===");
  (bookings || []).forEach(b => {
    console.log(`ID: ${b.id} | Guest: ${b.guest} | Room: ${b.room} | Status: ${b.status} | Price: ${b.price} | Payment: ${b.payment}`);
  });

  console.log("\n=== PAYMENTS ===");
  (payments || []).forEach(p => {
    console.log(`ID: ${p.id} | Booking: ${p.booking} | Guest: ${p.guest} | Amount: ${p.amount} | Status: ${p.status}`);
  });
}

run();
