import { NextRequest, NextResponse } from 'next/server';

// Rate limiting: Store last check timestamp per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 3000; // 3 seconds between checks

interface ZeroBounceResponse {
  data: {
    id: string;
    email: string;
    username: string;
    domain: string;
    did_you_mean: string | null;
    mx_record: string;
    provider: string;
    score: number;
    isv_format: boolean;
    isv_domain: boolean;
    isv_mx: boolean;
    isv_noblock: boolean;
    isv_nocatchall: boolean;
    isv_nogeneric: boolean;
    is_disposable: boolean;
    is_free: boolean;
    avatar: string | null;
    result: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
    reason: string;
  };
  error: any;
}

// Common disposable email domains (fallback)
const DISPOSABLE_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwaway.email', 'temp-mail.org', 'fakeinbox.com', 'trashmail.com',
  'maildrop.cc', 'getnada.com', 'yopmail.com', 'mintemail.com'
];

// Common typos for popular domains
const DOMAIN_SUGGESTIONS: Record<string, string> = {
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yahoo.con': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'hotmail.con': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlook.con': 'outlook.com',
  'outlook.co': 'outlook.com',
};

function checkDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.some(d => domain?.includes(d));
}

function getSuggestion(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && DOMAIN_SUGGESTIONS[domain]) {
    return email.replace(/@.*$/, '@' + DOMAIN_SUGGESTIONS[domain]);
  }
  return null;
}

function basicEmailValidation(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidFormat = emailRegex.test(email);
  const isDisposable = checkDisposableEmail(email);
  const suggestion = getSuggestion(email);
  
  return {
    email,
    isValidFormat,
    isDeliverable: isValidFormat && !isDisposable,
    isDisposable,
    isRoleEmail: false,
    isCatchAll: false,
    mxFound: true,
    smtpValid: true,
    qualityScore: isValidFormat && !isDisposable ? 0.85 : 0.3,
    bounceRisk: isValidFormat && !isDisposable ? 'low' : 'high',
    suggestion,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const lastCheck = rateLimitMap.get(ip);
    const now = Date.now();
    
    if (lastCheck && now - lastCheck < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Update rate limit
    rateLimitMap.set(ip, now);

    // Try ZeroBounce API (mails.so)
    try {
      const apiKey = '5e7ad163-e51a-4019-8f67-bd543d466906';
      const apiUrl = `https://api.mails.so/v1/validate?email=${encodeURIComponent(email)}`;

      console.log('Validating email with ZeroBounce:', email);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'x-mails-api-key': apiKey,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const zbResponse: ZeroBounceResponse = await response.json();
        console.log('ZeroBounce response:', zbResponse);

        // Check if there's an error in response
        if (zbResponse.error) {
          console.warn('ZeroBounce API error:', zbResponse.error);
          throw new Error('ZeroBounce API error');
        }

        const data = zbResponse.data;

        // Map ZeroBounce response to our format
        const isDeliverable = data.result === 'deliverable';
        const isRisky = data.result === 'risky';
        const qualityScore = data.score / 100; // Convert 0-100 to 0-1

        const result = {
          email: data.email,
          isValidFormat: data.isv_format,
          isDeliverable: isDeliverable || isRisky, // Risky emails can still be valid
          isDisposable: data.is_disposable,
          isRoleEmail: !data.isv_nogeneric, // nogeneric means not a generic/role email
          isCatchAll: !data.isv_nocatchall, // nocatchall means not a catch-all
          mxFound: data.isv_mx,
          smtpValid: data.isv_domain && data.isv_mx,
          qualityScore,
          bounceRisk: isDeliverable ? 'low' : (isRisky ? 'medium' : 'high'),
          suggestion: data.did_you_mean || getSuggestion(email),
        };

        console.log('✅ Email validation success:', result);
        return NextResponse.json(result);
      } else {
        const errorText = await response.text();
        console.warn('❌ ZeroBounce API failed:', response.status, errorText);
      }
    } catch (apiError) {
      console.warn('❌ ZeroBounce API error, using fallback:', apiError);
    }

    // Fallback to basic validation
    const basicResult = basicEmailValidation(email);
    console.log('⚠️ Using fallback validation:', basicResult);
    return NextResponse.json(basicResult);

  } catch (error) {
    console.error('❌ Email validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate email' },
      { status: 500 }
    );
  }
}