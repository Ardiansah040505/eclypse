FROM php:8.4-cli

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring xml zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY --chown=www-data:www-data . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www

# Set permissions
RUN chmod -R 755 /var/www/storage /var/www/bootstrap/cache

# Railway requires listening on PORT env var
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check - Railway needs this
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start server - Railway injects PORT env var
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=$PORT"]
