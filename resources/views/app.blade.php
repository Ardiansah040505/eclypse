<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ECLYPSE - Climate Learning</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('css/style.css')}}">
</head>
<body>

{{-- Background Layers --}}
<canvas id="bg-canvas"></canvas>
<div class="cloud-layer" id="cloudLayer"></div>
<div id="bgFloaters"></div>

{{-- ═══════════════════════ LOGIN PAGE ═══════════════════════ --}}
@include('auth.login')

{{-- ═══════════════════════ NAVBAR ═══════════════════════ --}}
@include('components.navbar')

{{-- ═══════════════════════ HOME PAGE ═══════════════════════ --}}
@include('student.home')

{{-- ═══════════════════════ TAHAP 1 - CLIMATE NEWS ═══════════════════════ --}}
@include('student.tahap1')

{{-- ═══════════════════════ TAHAP 2 - VIDEO & ECO CARDS ═══════════════════════ --}}
@include('student.tahap2')

{{-- ═══════════════════════ TAHAP 3 - PREPARATION ROOM ═══════════════════════ --}}
@include('student.tahap3')

{{-- ═══════════════════════ TAHAP 4 - DEBATE ═══════════════════════ --}}
@include('student.tahap4')

{{-- ═══════════════════════ TAHAP 5 - REFLEKSI ═══════════════════════ --}}
@include('student.tahap5')

{{-- ═══════════════════════ ALL MODALS ═══════════════════════ --}}
@include('components.modal')

{{-- ═══════════════════════ SPIN WHEEL MODAL ═══════════════════════ --}}
@include('components.spin-wheel')

{{-- Toast --}}
<div class="toast" id="toast">✅ Berhasil!</div>

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

</body>
</html>
