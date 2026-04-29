"""
Newsletter subscription service.

Handles newsletter subscription logic including:
- Email validation
- Duplicate prevention
- Unsubscribe token generation
- Database operations via Supabase
"""

import hashlib
import secrets
import re
from typing import Optional, Dict, Any
from services.supabase_client import get_supabase_client


class NewsletterServiceError(Exception):
    """Base exception for newsletter service errors."""
    pass


class InvalidEmailError(NewsletterServiceError):
    """Raised when email format is invalid."""
    pass


class DuplicateSubscriptionError(NewsletterServiceError):
    """Raised when email is already subscribed."""
    pass


def validate_email(email: str) -> bool:
    """
    Validate email format using RFC 5322 compliant regex.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def generate_unsubscribe_token(email: str) -> str:
    """
    Generate a secure unsubscribe token.
    
    Args:
        email: Subscriber email
        
    Returns:
        Secure token string
    """
    random_part = secrets.token_urlsafe(32)
    email_hash = hashlib.sha256(email.encode()).hexdigest()[:16]
    return f"{random_part}_{email_hash}"


def subscribe_email(
    email: str,
    source: str = 'homepage',
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Subscribe an email to the newsletter.
    
    Args:
        email: Email address to subscribe
        source: Source of subscription (homepage, footer, popup, etc.)
        metadata: Additional metadata to store
        
    Returns:
        Dictionary with subscription details
        
    Raises:
        InvalidEmailError: If email format is invalid
        DuplicateSubscriptionError: If email is already subscribed
        NewsletterServiceError: For other errors
    """
    # Normalize email
    email = email.strip().lower()
    
    # Validate email format
    if not validate_email(email):
        raise InvalidEmailError(f"Invalid email format: {email}")
    
    # Generate unsubscribe token
    unsubscribe_token = generate_unsubscribe_token(email)
    
    # Prepare data
    subscriber_data = {
        'email': email,
        'is_active': True,
        'unsubscribe_token': unsubscribe_token,
        'source': source,
        'metadata': metadata or {}
    }
    
    try:
        supabase = get_supabase_client()
        
        # Check if email already exists
        existing = supabase.table('newsletter_subscribers')\
            .select('id, email, is_active')\
            .eq('email', email)\
            .execute()
        
        if existing.data:
            subscriber = existing.data[0]
            if subscriber['is_active']:
                raise DuplicateSubscriptionError(f"Email already subscribed: {email}")
            else:
                # Reactivate subscription
                result = supabase.table('newsletter_subscribers')\
                    .update({
                        'is_active': True,
                        'subscribed_at': 'NOW()',
                        'source': source,
                        'metadata': metadata or {}
                    })\
                    .eq('id', subscriber['id'])\
                    .execute()
                
                return {
                    'success': True,
                    'message': 'Subscription reactivated successfully',
                    'email': email,
                    'reactivated': True
                }
        
        # Insert new subscription
        result = supabase.table('newsletter_subscribers')\
            .insert(subscriber_data)\
            .execute()
        
        if not result.data:
            raise NewsletterServiceError("Failed to create subscription")
        
        return {
            'success': True,
            'message': 'Successfully subscribed to newsletter',
            'email': email,
            'reactivated': False
        }
        
    except DuplicateSubscriptionError:
        raise
    except Exception as e:
        raise NewsletterServiceError(f"Database error: {str(e)}")


def unsubscribe_email(token: str) -> Dict[str, Any]:
    """
    Unsubscribe an email using the unsubscribe token.
    
    Args:
        token: Unsubscribe token
        
    Returns:
        Dictionary with unsubscribe status
        
    Raises:
        NewsletterServiceError: If token is invalid or operation fails
    """
    try:
        supabase = get_supabase_client()
        
        # Find subscriber by token
        result = supabase.table('newsletter_subscribers')\
            .select('id, email, is_active')\
            .eq('unsubscribe_token', token)\
            .execute()
        
        if not result.data:
            raise NewsletterServiceError("Invalid unsubscribe token")
        
        subscriber = result.data[0]
        
        if not subscriber['is_active']:
            return {
                'success': True,
                'message': 'Already unsubscribed',
                'email': subscriber['email']
            }
        
        # Deactivate subscription
        supabase.table('newsletter_subscribers')\
            .update({'is_active': False})\
            .eq('id', subscriber['id'])\
            .execute()
        
        return {
            'success': True,
            'message': 'Successfully unsubscribed from newsletter',
            'email': subscriber['email']
        }
        
    except Exception as e:
        raise NewsletterServiceError(f"Unsubscribe error: {str(e)}")


def get_active_subscribers_count() -> int:
    """
    Get count of active newsletter subscribers.
    
    Returns:
        Number of active subscribers
    """
    try:
        supabase = get_supabase_client()
        result = supabase.table('newsletter_subscribers')\
            .select('id', count='exact')\
            .eq('is_active', True)\
            .execute()
        
        return result.count or 0
    except Exception:
        return 0
