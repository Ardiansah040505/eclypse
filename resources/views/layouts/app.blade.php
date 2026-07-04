<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>@yield('title', 'ECLYPSE - Climate Learning')</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('css/style.css') }}">
@stack('styles')
</head>
<body>

{{-- Background Layers --}}
<canvas id="bg-canvas"></canvas>
<div class="cloud-layer" id="cloudLayer"></div>
<div id="bgFloaters"></div>

{{-- Toast Notification --}}
<div class="toast" id="toast">✅ Berhasil!</div>

{{-- Main Content --}}
@yield('content')

{{-- Modals Section --}}
@include('components.modal')

{{-- JavaScript Modules --}}
<script src="{{ asset('js/modules/state.js') }}"></script>
<script src="{{ asset('js/modules/utils.js') }}"></script>
<script src="{{ asset('js/modules/recap.js') }}"></script>
<script src="{{ asset('js/modules/auth.js') }}"></script>
<script src="{{ asset('js/modules/navigation.js') }}"></script>
<script src="{{ asset('js/modules/tahap1.js') }}"></script>
<script src="{{ asset('js/modules/tahap2.js') }}"></script>
<script src="{{ asset('js/modules/tahap3.js') }}"></script>
<script src="{{ asset('js/modules/tahap4.js') }}"></script>
<script src="{{ asset('js/modules/tahap5.js') }}"></script>
<script src="{{ asset('js/script.js') }}"></script>

@stack('scripts')
</body>
</html>
