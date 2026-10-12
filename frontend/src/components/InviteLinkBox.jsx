import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export const inviteUrl = (teamId, code) => `${window.location.origin}/join/${teamId}/${code}`;

export const InviteLinkBox = ({ teamId, code, testId }) => {
  const [copied, setCopied] = useState(false);
  const url = inviteUrl(teamId, code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Invite link copied. Paste it into WhatsApp, Slack or email.');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Could not copy. Select the link and copy it manually.');
    }
  };

  const share = () => navigator.share({ title: 'Join my Awesome Life team', text: 'Join my fitness team on Awesome Life:', url }).catch(() => {});

  return (
    <div data-testid={testId}>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Invite link</p>
      <div className="flex gap-2">
        <input readOnly value={url} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono" data-testid={`${testId}-url`} />
        <button onClick={copy} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-1.5" data-testid={`${testId}-copy`}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy'}
        </button>
        {typeof navigator.share === 'function' && (
          <button onClick={share} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm" data-testid={`${testId}-share`} aria-label="Share invite link">
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
