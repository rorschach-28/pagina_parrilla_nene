/**
 * SISTEMA DE GESTIÓN DE ENCUESTAS - PARRILLA NENÉ
 * Versión Blindada: Bloqueo por sesión y limpieza de historial
 */

// 1. ESTO VA AFUERA Y ARRIBA DE TODO: 
// Si ya la envió, lo mandamos al index antes de que el navegador procese el DOM
if (sessionStorage.getItem('encuestaEnviada') === 'true') {
    window.location.replace('index.html');
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('survey-form');
    if (!form) return;

    // Configuración para alertas de error
    const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#0a0a0a',
        color: '#ffffff'
    });

    const manejarError = (elemento, mensaje) => {
        Toast.fire({ icon: 'warning', title: mensaje });
        elemento.classList.add('input-error');
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Validaciones de entrada
    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const whatsapp = document.getElementById('whatsapp');
    const nacimiento = document.getElementById('nacimiento');

    if (nombre) nombre.oninput = (e) => e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').substring(0, 20);
    if (apellido) apellido.oninput = (e) => e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').substring(0, 20);
    if (whatsapp) whatsapp.oninput = (e) => e.target.value = e.target.value.replace(/\D/g, '').substring(0, 13);

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        // (Tus validaciones de campos aquí...)
        if (!nombre.value.trim() || !apellido.value.trim() || !nacimiento.value || whatsapp.value.length < 10) {
            return manejarError(form, "Por favor, completa todos los campos correctamente.");
        }

        const datos = {
            fecha: new Date().toLocaleDateString('es-AR'),
            nombre: nombre.value.trim(),
            apellido: apellido.value.trim(),
            whatsapp: whatsapp.value,
            platos: document.querySelector('input[name="platos"]:checked')?.value,
            atencion: document.querySelector('input[name="atencion"]:checked')?.value,
            ambiente: document.querySelector('input[name="ambiente"]:checked')?.value,
            invitar: document.querySelector('input[name="invitar"]:checked')?.value,
            comentario: document.getElementById('critica')?.value
        };

        // Alerta de carga (Spinner)
        Swal.fire({
            title: 'Enviando...',
            text: 'Guardando tu experiencia.',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyRLWz6Ay3Y_8jPJZ8rsLvh9_O0liHt2qgXZToL3e3y4fSDriGMZo8e0RChp21drAw1/exec";
            await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(datos) });

            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            
            // ÉXITO
            Swal.fire({
                icon: 'success',
                title: '¡Muchas gracias!',
                text: 'Redirigiendo al inicio...',
                timer: 2500, 
                timerProgressBar: true,
                showConfirmButton: false,
                allowOutsideClick: false
            }).then(() => {
                // LA CLAVE: Guardamos la marca de que ya terminó
                sessionStorage.setItem('encuestaEnviada', 'true');
                
                // PISAR EL HISTORIAL: Reemplazamos "encuesta.html" por "index.html"
                window.location.replace('index.html');
            });

        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No pudimos enviar la encuesta.' });
        }
    });
});