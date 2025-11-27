#!/bin/bash
set -e

# Fix permissions for Laravel storage directories
echo "Fixing storage permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Wait for MySQL to be ready
echo "Waiting for MySQL..."
timeout=60
counter=0
until nc -z "$DB_HOST" 3306; do
    counter=$((counter+1))
    if [ $counter -gt $timeout ]; then
        echo "Error: Timeout waiting for MySQL"
        exit 1
    fi
    echo "MySQL is unavailable - sleeping"
    sleep 2
done

echo "MySQL is up - executing command"

# Generate APP_KEY if not exists
if ! grep -q "APP_KEY=base64:" .env; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations first (creates cache table)
echo "Running migrations..."
php artisan migrate --force

# Now clear and optimize
echo "Optimizing Laravel..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Cache for production
if [ "$APP_ENV" = "production" ]; then
    echo "Caching configuration..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Start Apache
echo "Starting Apache..."
exec apache2-foreground
