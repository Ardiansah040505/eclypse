FROM php:8.4-cli

# Set working directory
WORKDIR /var/www

# Install system dependencies
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

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring xml zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js 20
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
RUN chmod -R 755 /var/www/storage /var/www/bootstrap/cache /var/www/public/build \
    && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/public/build

# Railway requires listening on PORT env var
ENV PORT=8000
ENV TRUSTED_PROXIES=*

# Expose port
EXPOSE 8000

# Start server - Railway injects PORT env var
# Using php-server built-in which handles routing better
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
