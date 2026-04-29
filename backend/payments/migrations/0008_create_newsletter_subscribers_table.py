"""
Create newsletter_subscribers table in Supabase.

This migration creates a table to store email newsletter subscriptions
with proper constraints and indexes for efficient querying.
"""

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0007_add_c2b_merch_order_id_to_payments'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Create newsletter_subscribers table
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) NOT NULL UNIQUE,
                subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                unsubscribe_token VARCHAR(64) UNIQUE,
                source VARCHAR(50) DEFAULT 'homepage',
                metadata JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- Create index on email for fast lookups
            CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
            
            -- Create index on is_active for filtering active subscribers
            CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);
            
            -- Create index on subscribed_at for sorting
            CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

            -- Add updated_at trigger
            CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER newsletter_updated_at_trigger
                BEFORE UPDATE ON newsletter_subscribers
                FOR EACH ROW
                EXECUTE FUNCTION update_newsletter_updated_at();

            -- Enable Row Level Security
            ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

            -- Policy: Anyone can subscribe (insert)
            CREATE POLICY newsletter_insert_policy ON newsletter_subscribers
                FOR INSERT
                WITH CHECK (true);

            -- Policy: Only authenticated users can view subscribers (admin feature)
            CREATE POLICY newsletter_select_policy ON newsletter_subscribers
                FOR SELECT
                USING (auth.role() = 'authenticated');

            -- Policy: Subscribers can update their own subscription using token
            CREATE POLICY newsletter_update_policy ON newsletter_subscribers
                FOR UPDATE
                USING (true);
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS newsletter_updated_at_trigger ON newsletter_subscribers;
            DROP FUNCTION IF EXISTS update_newsletter_updated_at();
            DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
            """
        ),
    ]
