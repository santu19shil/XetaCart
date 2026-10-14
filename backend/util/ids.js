// Customer ID utilities.
// Every customer (buyer) gets a stable, human-friendly ID such as "xetacart001".
// The seller account has NO customer ID (it is not a customer).

const PREFIX = 'xetacart';

// Parse the numeric suffix of a customer_id (e.g. "xetacart042" -> 42).
function parseSeq(customerId) {
  if (!customerId || typeof customerId !== 'string' || !customerId.startsWith(PREFIX)) return 0;
  const num = parseInt(customerId.slice(PREFIX.length), 10);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

function formatCustomerId(seq) {
  return `${PREFIX}${String(seq).padStart(3, '0')}`;
}

// Returns the next available customer ID (used at registration time).
async function nextCustomerId(supabase) {
  const { data, error } = await supabase
    .from('users')
    .select('customer_id')
    .not('customer_id', 'is', null);

  if (error) throw new Error(error.message || 'Failed to read customer IDs');

  const maxSeq = (data || []).reduce((max, row) => Math.max(max, parseSeq(row.customer_id)), 0);
  return formatCustomerId(maxSeq + 1);
}

// Assign customer IDs to existing customers that do not have one yet.
// Idempotent and cheap when there is nothing to do. Safe to run on startup.
async function ensureCustomerIds(supabase) {
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('customer_id')
    .not('customer_id', 'is', null);

  if (existingError) {
    console.error('ensureCustomerIds: could not read existing IDs:', existingError.message);
    return;
  }

  let nextSeq = (existing || []).reduce((max, row) => Math.max(max, parseSeq(row.customer_id)), 0);

  const { data: missing, error: missingError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'customer')
    .is('customer_id', null)
    .order('id', { ascending: true });

  if (missingError) {
    console.error('ensureCustomerIds: could not find customers without IDs:', missingError.message);
    return;
  }
  if (!missing || missing.length === 0) return;

  let assigned = 0;
  for (const user of missing) {
    nextSeq += 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({ customer_id: formatCustomerId(nextSeq) })
      .eq('id', user.id);

    if (updateError) {
      console.error(`ensureCustomerIds: failed for user ${user.id}:`, updateError.message);
    } else {
      assigned += 1;
    }
  }

  if (assigned > 0) {
    console.log(`ensureCustomerIds: assigned customer IDs to ${assigned} existing customer(s).`);
  }
}

module.exports = { nextCustomerId, ensureCustomerIds, formatCustomerId, parseSeq };