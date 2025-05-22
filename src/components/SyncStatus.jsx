export default function SyncStatus({ status }) {
    const colors = {
      synced: 'green',
      syncing: 'orange',
      unsynced: 'red',
      error: 'red',
    };
  
    return (
      <span style={{ color: colors[status] || 'gray', fontWeight: 'bold' }}>
        {status === 'synced' && '✓ Synced'}
        {status === 'syncing' && '⏳ Syncing...'}
        {status === 'unsynced' && '⚠ Unsynced'}
        {status === 'error' && '❌ Error'}
      </span>
    );
  }
  