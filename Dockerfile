FROM php:8.4-cli

# Set working directory
WORKDIR /var/www

# Install system dependencies (including libzip-dev for PHP zip extension)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libcurl4-openssl-dev \
    zip \
    unzip \
    curl \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (order matters - libzip-dev must be installed first)
RUN docker-php-ext-install pdo_mysql mbstring xml zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js 20 and npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node --version && npm --version && php --version

# Copy application files
COPY --chown=www-data:www-data . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www

# Install JavaScript dependencies
RUN npm install

# Build frontend assets (Vite production build)
RUN npm run build

# Set permissions for Laravel storage
RUN chmod -R 755 /var/www/storage /var/www/bootstrap/cache \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/public/build

# Railway requires listening on PORT env var
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start server - Railway injects PORT env var
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=$PORT"]
