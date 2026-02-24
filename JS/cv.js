// Función para el modo oscuro/claro
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-dark-mode');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar el tema guardado
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
    
    // Manejar el clic del botón
    toggleButton.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Actualizar el año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Efecto de scroll suave para los enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animación de habilidades al aparecer
    const skillBars = document.querySelectorAll('.skill-level');
    
    const animateSkills = () => {
        skillBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    };
    
    // Observador de intersección para animar habilidades cuando son visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkills();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    const skillsSection = document.getElementById('habilidades');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
    
    // Traductor de Google
    function googleTranslateElementInit() {
        new google.translate.TranslateElement({
            pageLanguage: 'es',
            includedLanguages: 'en,es,fr,de,it,pt',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
    }
    
    // Cargar el script del traductor si no está ya cargado
    if (!window.google || !window.google.translate) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }
    
    // Mejorar la accesibilidad del botón de descarga
    const downloadBtn = document.getElementById('download-cv');
    if (downloadBtn) {
        downloadBtn.addEventListener('focus', function() {
            this.style.outline = `2px solid ${getComputedStyle(document.documentElement).getPropertyValue('--primary-color')}`;
            this.style.outlineOffset = '2px';
        });
        
        downloadBtn.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    }
    
    // Efecto hover para las tarjetas de sección
    const sectionCards = document.querySelectorAll('.section-card');
    sectionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
});

// Corrección del modo oscuro mejorado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar el tema al cargar la página
    function checkTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = savedTheme === 'system' ? systemTheme : savedTheme;
        
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        
        // Actualizar el icono del botón
        const toggleButton = document.getElementById('toggle-dark-mode');
        if (toggleButton) {
            const icon = toggleButton.querySelector('i');
            if (currentTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }
    
    // Escuchar cambios en las preferencias del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkTheme);
    
    // Inicializar
    checkTheme();
});

// ================== SISTEMA DE DESCARGA DE CV MEJORADO (VERSIÓN FINAL) ==================

class CVDownloadManager {
    constructor() {
        // Rutas donde buscar el archivo CV
        this.basePaths = [
            './DOCS/',      // Ruta principal
            '../DOCS/',     // Alternativa un nivel arriba
            './'            // Raíz
        ];
        
        // Nombres de archivo a buscar
        this.fileVariants = [
            'CurrículumVitae-Pedro.pdf',
            'CV_PedroOrtizPlaza.pdf',
            'cv.pdf'
        ];
        
        this.notificationQueue = [];
        this.isDownloading = false;
    }

    // =============== VERIFICACIÓN DE ARCHIVOS ===============

    /**
     * Verifica si un archivo existe
     * @param {string} url - URL del archivo
     * @returns {Promise<boolean>}
     */
    async checkFileExists(url) {
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok && response.status === 200;
        } catch (error) {
            console.warn(`Error verificando ${url}:`, error);
            return false;
        }
    }

    /**
     * Encuentra la primera ruta válida del CV
     * @returns {Promise<string|null>}
     */
    async findValidCVPath() {
        // Crear todas las combinaciones posibles
        const allPaths = [];
        for (const basePath of this.basePaths) {
            for (const fileName of this.fileVariants) {
                allPaths.push(basePath + fileName);
            }
        }

        console.log('Buscando archivo en las siguientes rutas:', allPaths);

        // Buscar en paralelo para mayor eficiencia
        const promises = allPaths.map(async (path) => {
            const exists = await this.checkFileExists(path);
            if (exists) {
                console.log(`✓ Archivo encontrado: ${path}`);
            }
            return exists ? path : null;
        });

        const results = await Promise.all(promises);
        return results.find(path => path !== null) || null;
    }

    // =============== DESCARGA SIMPLE Y EFECTIVA ===============

    /**
     * Descarga el archivo de forma directa y simple
     * @param {string} filePath - Ruta del archivo
     * @param {string} fileName - Nombre para la descarga
     */
    initiateDownload(filePath, fileName = 'CurriculumVitae-Pedro.pdf') {
        try {
            console.log(`Iniciando descarga de: ${filePath}`);
            
            // Crear enlace de descarga (MÉTODO SIMPLE)
            const link = document.createElement('a');
            link.href = filePath;
            link.download = fileName;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // Agregar al DOM temporalmente
            document.body.appendChild(link);
            
            // Simular click
            link.click();
            
            // Limpiar
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
            
            // Confirmar descarga
            this.showNotification('Descarga iniciada correctamente', 'success');
            console.log('✓ Descarga completada');
            
        } catch (error) {
            console.error('Error en la descarga:', error);
            this.showNotification('Error al iniciar la descarga', 'error');
        }
    }

    // =============== FUNCIÓN PRINCIPAL DE DESCARGA ===============

    /**
     * Función principal para descargar el CV
     * Busca el archivo y si no lo encuentra, muestra opciones alternativas
     */
    async downloadCV() {
        if (this.isDownloading) {
            this.showNotification('Descarga en progreso...', 'info');
            return;
        }

        this.isDownloading = true;
        this.showNotification('Buscando archivo de CV...', 'info');

        try {
            // Buscar el archivo en todas las rutas posibles
            const validPath = await this.findValidCVPath();
            
            if (validPath) {
                // Si se encuentra, iniciar descarga
                this.initiateDownload(validPath);
            } else {
                // Si NO se encuentra, mostrar opciones alternativas
                console.warn('No se encontró el archivo en ninguna ruta');
                this.showNotification('No se encontró el archivo de CV', 'error');
                
                // IMPORTANTE: Mostrar modal con opciones alternativas
                this.showAlternativeOptions();
            }
        } catch (error) {
            console.error('Error en downloadCV:', error);
            this.showNotification('Error al buscar el archivo', 'error');
            
            // En caso de error, también mostrar opciones alternativas
            this.showAlternativeOptions();
        } finally {
            this.isDownloading = false;
        }
    }

    // =============== NOTIFICACIONES ===============

    /**
     * Muestra notificaciones mejoradas
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación
     */
    showNotification(message, type = 'info') {
        // Evitar spam de notificaciones
        if (this.notificationQueue.some(n => n.message === message)) {
            return;
        }

        const notification = {
            message,
            type,
            id: Date.now()
        };

        this.notificationQueue.push(notification);
        this.displayNotification(notification);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 5000);
    }

    /**
     * Muestra la notificación en el DOM
     * @param {Object} notification - Objeto de notificación
     */
    displayNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `cv-notification ${notification.type}`;
        notificationElement.setAttribute('data-notification-id', notification.id);
        notificationElement.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(notification.type)}</span>
                <span class="notification-message">${notification.message}</span>
                <button class="notification-close" onclick="cvManager.removeNotification(${notification.id})">×</button>
            </div>
        `;

        // Estilos mejorados
        Object.assign(notificationElement.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            minWidth: '300px',
            maxWidth: '400px',
            padding: '0',
            background: this.getNotificationColor(notification.type),
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px'
        });

        // Agregar estilos para el contenido (solo una vez)
        if (!document.getElementById('cv-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'cv-notification-styles';
            style.textContent = `
                .notification-content {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    gap: 10px;
                }
                .notification-icon {
                    font-size: 16px;
                    flex-shrink: 0;
                }
                .notification-message {
                    flex: 1;
                    line-height: 1.4;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.2);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notificationElement);

        // Animación de entrada
        requestAnimationFrame(() => {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateX(0)';
        });
    }

    /**
     * Elimina una notificación
     * @param {number} notificationId - ID de la notificación
     */
    removeNotification(notificationId) {
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        // Eliminar de la cola
        this.notificationQueue = this.notificationQueue.filter(n => n.id !== notificationId);
    }

    /**
     * Obtiene el icono para cada tipo de notificación
     * @param {string} type - Tipo de notificación
     * @returns {string}
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Obtiene el color para cada tipo de notificación
     * @param {string} type - Tipo de notificación
     * @returns {string}
     */
    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #4a6fa8, #357abd)',
            error: 'linear-gradient(135deg, #e63946, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #2a9d8f, #0891b2)'
        };
        return colors[type] || colors.info;
    }

    // =============== OPCIONES ALTERNATIVAS (MODAL) ===============

    /**
     * Muestra opciones alternativas cuando no se encuentra el archivo
     * TRES OPCIONES:
     * 1. Solicitar por email
     * 2. Reintentar descarga
     * 3. Ver portfolio en GitHub
     */
    showAlternativeOptions() {
        // Evitar duplicar el modal
        if (document.querySelector('.cv-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'cv-modal';
        modal.innerHTML = `
            <div class="cv-modal-content">
                <div class="cv-modal-header">
                    <h3>Archivo de CV no encontrado</h3>
                    <button class="cv-modal-close" onclick="this.closest('.cv-modal').remove()">×</button>
                </div>
                <div class="cv-modal-body">
                    <p>No se pudo encontrar el archivo de CV en las ubicaciones esperadas.</p>
                    <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                        Puedes solicitar el CV por email, reintentar la descarga o visitar mi portfolio.
                    </p>
                    <div class="cv-modal-actions">
                        <button class="cv-btn cv-btn-primary" onclick="cvManager.contactForCV()">
                            📧 Solicitar CV por email
                        </button>
                        <button class="cv-btn cv-btn-secondary" onclick="cvManager.retryDownload()">
                            🔄 Reintentar descarga
                        </button>
                        <button class="cv-btn cv-btn-secondary" onclick="window.open('https://pedroprogramacion.github.io/Mi_Portfolio/', '_blank')">
                            🔗 Ver Portfolio en GitHub
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar estilos del modal (solo una vez)
        if (!document.getElementById('cv-modal-styles')) {
            const modalStyle = document.createElement('style');
            modalStyle.id = 'cv-modal-styles';
            modalStyle.textContent = `
                .cv-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10001;
                    animation: fadeIn 0.3s ease;
                }
                .cv-modal-content {
                    background: white;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    animation: slideIn 0.3s ease;
                }
                .cv-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                }
                .cv-modal-header h3 {
                    margin: 0;
                    color: #333;
                }
                .cv-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                .cv-modal-close:hover {
                    background: #f5f5f5;
                }
                .cv-modal-body {
                    padding: 20px;
                }
                .cv-modal-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 20px;
                }
                .cv-btn {
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                    transition: all 0.2s;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .cv-btn-primary {
                    background: #4a6fa8;
                    color: white;
                }
                .cv-btn-primary:hover {
                    background: #357abd;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(74, 111, 168, 0.4);
                }
                .cv-btn-secondary {
                    background: #f8f9fa;
                    color: #333;
                    border: 2px solid #dee2e6;
                }
                .cv-btn-secondary:hover {
                    background: #e9ecef;
                    border-color: #adb5bd;
                    transform: translateY(-2px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(modalStyle);
        }

        document.body.appendChild(modal);

        // Cerrar modal al hacer click fuera
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // =============== ACCIONES DEL MODAL ===============
    /**
     * Abre el cliente de email para solicitar el CV
     */
    contactForCV() {
        const subject = encodeURIComponent('Solicitud de CV - Pedro Ortiz Plaza');
        const body = encodeURIComponent(`Hola Pedro,Me gustaría solicitar tu CV actualizado.Gracias,`);
        const mailtoLink = `mailto:ortizplazapedro5@gmail.com?subject=${subject}&body=${body}`;
        
        window.open(mailtoLink);
        
        // Cerrar modal
        const modal = document.querySelector('.cv-modal');
        if (modal) modal.remove();
        
        this.showNotification('Cliente de email abierto', 'success');
    }

    /**
     * Reintenta la descarga del CV
     */
    async retryDownload() {
        // Cerrar modal si existe
        const modal = document.querySelector('.cv-modal');
        if (modal) modal.remove();

        // Reintentar la descarga
        await this.downloadCV();
    }

    // =============== INICIALIZACIÓN ===============

    /**
     * Inicializa el sistema de descarga
     */
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            const downloadBtn = document.getElementById('download-cv');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.downloadCV();
                });
                console.log('✓ Sistema de descarga de CV inicializado correctamente');
            } else {
                console.warn('⚠ No se encontró el botón de descarga #download-cv');
            }
        });
    }
}

// =============== INSTANCIA GLOBAL ===============
// Crear instancia global del manager
const cvManager = new CVDownloadManager();
// Inicializar cuando se carga el DOM
cvManager.init();
// Exportar para uso global
window.cvManager = cvManager;


// ================== SISTEMA DE TRADUCCIÓN MEJORADO ==================
document.addEventListener('DOMContentLoaded', function() {
    // Textos traducidos para 10 idiomas (actualizado y completo)
    const translations = {
            'es': {
            'page_title': 'Pedro Ortiz Plaza - CV Profesional',
            'header_title': 'Pedro Ortiz Plaza',
            'header_subtitle': 'Administrativo & Programador de Sistemas',
            'location': 'Castilla-La Mancha, España',
            'menu_experience': 'Experiencia',
            'menu_education': 'Formación',
            'menu_skills': 'Habilidades',
            'menu_other': 'Otros datos',
            'menu_language': 'Idioma',
            'download_cv': 'Descargar CV',
            'experience_title': 'Experiencia Profesional',
            'internship_title': 'Prácticas de Formación Profesional',
            'internship_description': 'Programación de Sistemas - CEAT. Prácticas que constan de 120 horas.',
            'admin_degree': 'Alcomasa - 520 horas de practicas',
            'basic_admin': 'Practicas Virtuales - 520 horas de practicas',
            'systems_programming_degree': 'Título Formación de grado 3 en Programación de Sistemas Informáticos',
            'equivalent_degree': 'Programación de Sistemas, equivalente a un grado superior',
            'ceat_course': 'CEAT - Programación de Sistemas Informáticos',
            'despliegue_firebase': 'Despliegue con Firebase y CPanel',
            'firebase_deploy': 'Despliegue con Firebase y CPanel',
            'springboot_use': 'Uso de Spring Boot y sus módulos (Thymeleaf, Security y base de datos)',
            'wordpress_training': 'Uso y formación en WordPress con Elementor',
            'intellij_use': 'Uso de IntelliJ IDEA y Java',
            'phpmyadmin_use': 'Uso de BDD con PHP MyAdmin y XAMPP',
            'vscode_use': 'Uso de Visual Studio Code (HTML, CSS y JavaScript)',
            'bootstrap_use': 'Uso de Bootstrap',
            'daw_course': 'Curso de grado superior de (DAW) Desarrollo de Aplicaciones Web',
            'netbeans_java': 'Apache NetBeans y Java',
            'windows_software': 'Uso de software de Windows',
            'linux_software': 'Uso de software de diferentes distribuciones de Linux',
            'command_line': 'Uso de línea de comandos en Windows y diferentes distribuciones de Linux',
            'virtualbox_use': 'Uso de máquinas virtuales con VirtualBox',
            'vscode_php': 'Uso de Visual Studio Code (HTML, CSS y PHP)',
            'mysql_use': 'Uso de MySQL Server',
            'hardware_knowledge': 'Conocimientos sobre el hardware interno de los equipos',
            'administration': 'Administración',
            'typing_course': 'Curso de grado Medio de mecanografía y programas informáticos',
            'windows': 'Windows',
            'sol_software': 'Software del SOL',
            'office_package': 'Paquete Office',
            'typing': 'Mecanografía',
            'basic_degree': 'Título Ciclo Formativo Básico / ESO',
            'secondary_education': 'Educación Secundaria Obligatoria',
            'basic_admin_course': 'Formación Profesional Básica de Administración',
            'technical_skills': 'Técnicas',
            'windows_systems': 'Sistemas Windows',
            'paqute_office': 'Paquete Office',
            'software_sol': 'Software del SOL',
            'bios_config': 'Configuración BIOS',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'php': 'PHP',
            'bdd': 'Bases de datos',
            'vbox': 'VirtualBox',
            'componentes_hardware': 'Componentes Hardware',
            'personal_skills': 'Personales',
            'responsible': 'Responsable y puntual',
            'organized': 'Organizado',
            'resolute': 'Resolutivo',
            'teamwork': 'Capacidad para trabajar en equipo',
            'good_presence': 'Buena presencia y trato',
            'spanish_native': 'Español (Nativo)',
            'english_b1': 'Inglés (B1)',
            'disability': 'Discapacidad reconocida del 40%',
            'politics_interest': 'Interés en política nacional e internacional',
            'portfolio_available': 'Portfolio disponible en',
            'connect_with_me': 'Conecta conmigo',
            'quick_links': 'Enlaces rápidos',
            'my_portfolio': 'Mi Portfolio',
            'contact': 'Contacto',
            'all_rights': 'Todos los derechos reservados.',
            'internship_li1': 'Realicé la optimización SEO de páginas web clave, incluyendo la página de contacto, para mejorar la visibilidad online.',
            'internship_li2': 'Gestioné y actualicé bases de datos en Excel, asegurando la correcta clasificación y filtrado de la información de cursos y acceso para trabajadores.',
            'internship_li3': 'Implementé cambios y actualizaciones en plataformas digitales, incluyendo la colocación de archivos en "Código Ágora" y la actualización de certificados de profesionalidad del sitio.',
            'internship_li4': 'Colaboré en la resolución de incidencias relacionadas con la documentación y la localización de archivos en sistemas internos.',
            'internship_li5': 'Apoyé en la preparación y organización de datos para cursos de formación, optimizando la gestión de información.',
            'internship_li6': 'Participé activamente en la comunicación interdepartamental para coordinar tareas y asegurar la fluidez de los proyectos digitales.',
            'admin_li1': 'Gestioné el servicio de atención y dirección de descarga de transportistas en una empresa dedicada a la destilación de vinos.',
            'admin_li2': 'Interactué con proveedores utilizando un programa propio de la empresa para la gestión de las operaciones.',
            'admin_li3': 'Mantuve un control diario de entradas en un archivo Excel, registrando la cantidad de litros recibidos, datos de la empresa proveedora, información del transportista y el total acumulado de lunes a viernes.',
            'admin_li4': 'Realicé la impresión de los registros de Excel y la posterior transcripción de litros, proveedores y matrículas de transportistas a una hoja de gestión de almacén donde se detallaban tanto los litros que entraban como los que salían.',
            'admin_li5': 'Colaboré en el proceso de etiquetado de vinos, donde se extraían muestras de determinados almacenes para su posterior análisis. No realicé las pruebas de laboratorio, pero participé en la fase de preparación y logística de las muestras.',
            'admin_li6': 'Apoyé en la logística y preparación de muestras de vino para pruebas de calidad, garantizando su correcta identificación y trazabilidad.',
            'basic_admin_li1': 'Desarrollé y presenté una detallada presentación empresarial para clientes potenciales, abarcando desde la identificación de la empresa hasta estrategias de mejora y nuevas tecnologías.',
            'basic_admin_li2': 'Gestioné tareas administrativas esenciales, incluyendo la elaboración del calendario laboral anual con festivos nacionales y locales, y la creación de plantillas en Excel para el registro de facturas emitidas y recibidas.',
            'basic_admin_li3': 'Organicé el archivo de facturas de clientes de 2019, aplicando un criterio numérico de clasificación.',
            'basic_admin_li4': 'Redacté comunicaciones internas (memorándums) y externas (cartas de reclamación por material en mal estado), demostrando habilidades de comunicación profesional.',
            'basic_admin_li5': 'Contribuí al establecimiento de normas de protocolo empresarial, tanto sociales como laborales, y desarrollé un decálogo de Prevención de Riesgos Laborales adaptado a la situación del COVID-19.',
            'basic_admin_li6': 'Manejé la recepción de llamadas de clientes, tomando nota de los mensajes y coordinando el seguimiento con la dirección.'
        },

        'en': {
            'page_title': 'Pedro Ortiz Plaza - Professional CV',
            'header_title': 'Pedro Ortiz Plaza',
            'header_subtitle': 'Administrative & Systems Programmer',
            'location': 'Castilla-La Mancha, Spain',
            'menu_experience': 'Experience',
            'menu_education': 'Education',
            'menu_skills': 'Skills',
            'menu_other': 'Other Info',
            'menu_language': 'Language',
            'download_cv': 'Download CV',
            'experience_title': 'Professional Experience',
            'internship_title': 'Vocational Training Internship',
            'internship_description': 'Systems Programming - CEAT. Internship consisting of 120 hours.',
            'admin_degree': 'Alcomasa - 520 hours of internships',
            'basic_admin': 'Virtual Internships - 520 hours of internships',
            'systems_programming_degree': 'Level 3 Training Title in Computer Systems Programming',
            'equivalent_degree': 'Systems Programming, equivalent to a higher degree',
            'ceat_course': 'CEAT - Computer Systems Programming',
            'despliegue_firebase': 'Deployment with Firebase and CPanel',
            'firebase_deploy': 'Deployment with Firebase and CPanel',
            'springboot_use': 'Use of Spring Boot and its modules (Thymeleaf, Security and database)',
            'wordpress_training': 'Use and training in WordPress with Elementor',
            'intellij_use': 'Use of IntelliJ IDEA and Java',
            'phpmyadmin_use': 'Database use with PHP MyAdmin and XAMPP',
            'vscode_use': 'Use of Visual Studio Code (HTML, CSS and JavaScript)',
            'bootstrap_use': 'Use of Bootstrap',
            'daw_course': 'Higher degree course in (DAW) Web Application Development',
            'netbeans_java': 'Apache NetBeans and Java',
            'windows_software': 'Use of Windows software',
            'linux_software': 'Use of software from different Linux distributions',
            'command_line': 'Use of command line in Windows and different Linux distributions',
            'virtualbox_use': 'Use of virtual machines with VirtualBox',
            'vscode_php': 'Use of Visual Studio Code (HTML, CSS and PHP)',
            'mysql_use': 'Use of MySQL Server',
            'hardware_knowledge': 'Knowledge about internal computer hardware',
            'administration': 'Administration',
            'typing_course': 'Medium grade course in typing and computer programs',
            'windows': 'Windows',
            'sol_software': 'SOL software',
            'office_package': 'Office package',
            'typing': 'Typing',
            'basic_degree': 'Basic Training Title / ESO',
            'secondary_education': 'Compulsory Secondary Education',
            'basic_admin_course': 'Basic Vocational Training in Administration',
            'technical_skills': 'Technical',
            'windows_systems': 'Windows Systems',
            'paqute_office': 'Office package',
            'software_sol': 'SOL Software',
            'bios_config': 'BIOS Configuration',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'php': 'PHP',
            'bdd': 'Databases',
            'vbox': 'VirtualBox',
            'componentes_hardware': 'Hardware Components',
            'personal_skills': 'Personal',
            'responsible': 'Responsible and punctual',
            'organized': 'Organized',
            'resolute': 'Resolute',
            'teamwork': 'Ability to work in a team',
            'good_presence': 'Good presence and treatment',
            'spanish_native': 'Spanish (Native)',
            'english_b1': 'English (B1)',
            'disability': 'Recognized disability of 40%',
            'politics_interest': 'Interest in national and international politics',
            'portfolio_available': 'Portfolio available on',
            'connect_with_me': 'Connect with me',
            'quick_links': 'Quick links',
            'my_portfolio': 'My Portfolio',
            'contact': 'Contact',
            'all_rights': 'All rights reserved.',
            'internship_li1': 'I performed SEO optimization of key web pages, including the contact page, to improve online visibility.',
            'internship_li2': 'I managed and updated databases in Excel, ensuring proper classification and filtering of course information and worker access.',
            'internship_li3': 'I implemented changes and updates to digital platforms, including file placement in "Código Ágora" and updating site professional certificates.',
            'internship_li4': 'I collaborated in resolving incidents related to documentation and file location in internal systems.',
            'internship_li5': 'I supported the preparation and organization of data for training courses, optimizing information management.',
            'internship_li6': 'I actively participated in interdepartmental communication to coordinate tasks and ensure the fluidity of digital projects.',
            'admin_li1': 'I managed the service of attention and direction of carrier unloading in a company dedicated to wine distillation.',
            'admin_li2': 'I interacted with suppliers using a company-specific program for operations management.',
            'admin_li3': 'I maintained a daily record of entries in an Excel file, recording the number of liters received, supplier company data, carrier information, and the weekly total from Monday to Friday.',
            'admin_li4': 'I printed Excel records and subsequently transcribed liters, suppliers, and carrier license plates to a warehouse management sheet detailing both incoming and outgoing liters.',
            'admin_li5': 'I collaborated in the wine labeling process, where samples were extracted from specific warehouses for subsequent analysis. I did not perform laboratory tests but participated in the sample preparation and logistics phase.',
            'admin_li6': 'I supported the logistics and preparation of wine samples for quality testing, ensuring proper identification and traceability.',
            'basic_admin_li1': 'I developed and presented a detailed business presentation for potential clients, covering from company identification to improvement strategies and new technologies.',
            'basic_admin_li2': 'I managed essential administrative tasks, including the preparation of the annual work calendar with national and local holidays, and creating Excel templates for recording issued and received invoices.',
            'basic_admin_li3': 'I organized the 2019 customer invoice file, applying a numerical classification criterion.',
            'basic_admin_li4': 'I drafted internal communications (memorandums) and external communications (claim letters for damaged material), demonstrating professional communication skills.',
            'basic_admin_li5': 'I contributed to the establishment of business protocol norms, both social and labor-related, and developed a Decalogue of Occupational Risk Prevention adapted to the COVID-19 situation.',
            'basic_admin_li6': 'I handled customer call reception, taking note of messages and coordinating follow-up with management.'
        },

        'fr': {
            'page_title': 'Pedro Ortiz Plaza - CV Professionnel',
            'header_title': 'Pedro Ortiz Plaza',
            'header_subtitle': 'Administratif & Programmeur de Systèmes',
            'location': 'Castille-La Manche, Espagne',
            'menu_experience': 'Expérience',
            'menu_education': 'Formation',
            'menu_skills': 'Compétences',
            'menu_other': 'Autres informations',
            'menu_language': 'Langue',
            'download_cv': 'Télécharger CV',
            'experience_title': 'Expérience Professionnelle',
            'internship_title': 'Stage de Formation Professionnelle',
            'internship_description': 'Programmation de Systèmes - CEAT. Stage de 120 heures.',
            'admin_degree': 'Alcomasa - 520 heures de stage',
            'basic_admin': 'Stages virtuels - 520 heures de stage',
            'systems_programming_degree': 'Titre de Formation de Niveau 3 en Programmation de Systèmes Informatiques',
            'equivalent_degree': 'Programmation de Systèmes, équivalent à un diplôme supérieur',
            'ceat_course': 'CEAT - Programmation de Systèmes Informatiques',
            'despliegue_firebase': 'Déploiement avec Firebase et CPanel',
            'firebase_deploy': 'Déploiement avec Firebase et CPanel',
            'springboot_use': 'Utilisation de Spring Boot et ses modules (Thymeleaf, Security et base de données)',
            'wordpress_training': 'Utilisation et formation sur WordPress avec Elementor',
            'intellij_use': 'Utilisation de IntelliJ IDEA et Java',
            'phpmyadmin_use': 'Utilisation de bases de données avec PHP MyAdmin et XAMPP',
            'vscode_use': 'Utilisation de Visual Studio Code (HTML, CSS et JavaScript)',
            'bootstrap_use': 'Utilisation de Bootstrap',
            'daw_course': 'Cours de diplôme supérieur en (DAW) Développement d\'Applications Web',
            'netbeans_java': 'Apache NetBeans et Java',
            'windows_software': 'Utilisation de logiciels Windows',
            'linux_software': 'Utilisation de logiciels de différentes distributions Linux',
            'command_line': 'Utilisation de la ligne de commande sous Windows et différentes distributions Linux',
            'virtualbox_use': 'Utilisation de machines virtuelles avec VirtualBox',
            'vscode_php': 'Utilisation de Visual Studio Code (HTML, CSS et PHP)',
            'mysql_use': 'Utilisation de MySQL Server',
            'hardware_knowledge': 'Connaissances sur le matériel interne des ordinateurs',
            'administration': 'Administration',
            'typing_course': 'Cours de niveau moyen en dactylographie et programmes informatiques',
            'windows': 'Windows',
            'sol_software': 'Logiciel SOL',
            'office_package': 'Suite Office',
            'typing': 'Dactylographie',
            'basic_degree': 'Titre de Formation de Base / ESO',
            'secondary_education': 'Enseignement Secondaire Obligatoire',
            'basic_admin_course': 'Formation Professionnelle de Base en Administration',
            'technical_skills': 'Techniques',
            'windows_systems': 'Systèmes Windows',
            'paqute_office': 'Suite Office',
            'software_sol': 'Logiciel SOL',
            'bios_config': 'Configuration BIOS',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'php': 'PHP',
            'bdd': 'Bases de données',
            'vbox': 'VirtualBox',
            'componentes_hardware': 'Composants Matériels',
            'personal_skills': 'Personnelles',
            'responsible': 'Responsable et ponctuel',
            'organized': 'Organisé',
            'resolute': 'Résolutif',
            'teamwork': 'Capacité à travailler en équipe',
            'good_presence': 'Bonne présence et traitement',
            'spanish_native': 'Espagnol (Natif)',
            'english_b1': 'Anglais (B1)',
            'disability': 'Handicap reconnu à 40%',
            'politics_interest': 'Intérêt pour la politique nationale et internationale',
            'portfolio_available': 'Portfolio disponible sur',
            'connect_with_me': 'Connectez avec moi',
            'quick_links': 'Liens rapides',
            'my_portfolio': 'Mon Portfolio',
            'contact': 'Contact',
            'all_rights': 'Tous droits réservés.',
            'internship_li1': 'J\'ai réalisé l\'optimisation SEO des pages web clés, y compris la page de contact, pour améliorer la visibilité en ligne.',
            'internship_li2': 'J\'ai géré et mis à jour des bases de données dans Excel, en assurant une classification et un filtrage corrects des informations des cours et de l\'accès des travailleurs.',
            'internship_li3': 'J\'ai mis en œuvre des modifications et des mises à jour sur des plateformes numériques, y compris le placement de fichiers dans "Código Ágora" et la mise à jour des certificats de professionnalité du site.',
            'internship_li4': 'J\'ai collaboré à la résolution d\'incidents liés à la documentation et à la localisation de fichiers dans les systèmes internes.',
            'internship_li5': 'J\'ai soutenu la préparation et l\'organisation des données pour les cours de formation, en optimisant la gestion de l\'information.',
            'internship_li6': 'J\'ai participé activement à la communication interdepartmentale pour coordonner les tâches et assurer la fluidité des projets numériques.',
            'admin_li1': 'J\'ai géré le service d\'attention et d\'orientation du déchargement des transporteurs dans une entreprise dédiée à la distillation de vins.',
            'admin_li2': 'J\'ai interagi avec les fournisseurs en utilisant un programme propre à l\'entreprise pour la gestion des opérations.',
            'admin_li3': 'J\'ai maintenu un contrôle quotidien des entrées dans un fichier Excel, enregistrant la quantité de litres reçus, les données de l\'entreprise fournisseuse, les informations du transporteur et le total accumulé du lundi au vendredi.',
            'admin_li4': 'J\'ai imprimé les registres Excel et ensuite transcrit les litres, les fournisseurs et les immatriculations des transporteurs sur une feuille de gestion d\'entrepôt détaillant à la fois les litres entrants et sortants.',
            'admin_li5': 'J\'ai collaboré au processus d\'étiquetage des vins, où des échantillons étaient extraits de certains entrepôts pour analyse ultérieure. Je n\'ai pas effectué les tests de laboratoire, mais j\'ai participé à la phase de préparation et de logistique des échantillons.',
            'admin_li6': 'J\'ai soutenu la logistique et la préparation des échantillons de vin pour les tests de qualité, en garantissant leur identification et traçabilité correctes.',
            'basic_admin_li1': 'J\'ai développé et présenté une présentation d\'entreprise détaillée pour des clients potentiels, couvrant de l\'identification de l\'entreprise aux stratégies d\'amélioration et aux nouvelles technologies.',
            'basic_admin_li2': 'J\'ai géré des tâches administratives essentielles, y compris l\'élaboration du calendrier de travail annuel avec les jours fériés nationaux et locaux, et la création de modèles Excel pour l\'enregistrement des factures émises et reçues.',
            'basic_admin_li3': 'J\'ai organisé le classement des factures clients de 2019, en appliquant un critère de classification numérique.',
            'basic_admin_li4': 'J\'ai rédigé des communications internes (mémorandums) et externes (lettres de réclamation pour matériel endommagé), démontrant des compétences en communication professionnelle.',
            'basic_admin_li5': 'J\'ai contribué à l\'établissement de normes de protocole d\'entreprise, à la fois sociales et professionnelles, et développé un décalogue de Prévention des Risques Professionnels adapté à la situation du COVID-19.',
            'basic_admin_li6': 'J\'ai géré la réception des appels clients, en prenant note des messages et en coordonnant le suivi avec la direction.'
        },

        'de': {
            'page_title': 'Pedro Ortiz Plaza - Professioneller Lebenslauf',
            'header_title': 'Pedro Ortiz Plaza',
            'header_subtitle': 'Verwaltungsangestellter & Systemprogrammierer',
            'location': 'Kastilien-La Mancha, Spanien',
            'menu_experience': 'Berufserfahrung',
            'menu_education': 'Ausbildung',
            'menu_skills': 'Fähigkeiten',
            'menu_other': 'Weitere Informationen',
            'menu_language': 'Sprache',
            'download_cv': 'Lebenslauf herunterladen',
            'experience_title': 'Berufserfahrung',
            'internship_title': 'Berufspraktikum',
            'internship_description': 'Systemprogrammierung - CEAT. Praktikum mit 120 Stunden.',
            'admin_degree': 'Alcomasa – 520 Stunden Praktikum',
            'basic_admin': 'Virtuelle Praktika – 520 Stunden Praktikum',
            'systems_programming_degree': 'Ausbildungsabschluss Stufe 3 in der Programmierung von Computersystemen',
            'equivalent_degree': 'Systemprogrammierung, gleichwertig mit einem höheren Abschluss',
            'ceat_course': 'CEAT - Programmierung von Computersystemen',
            'despliegue_firebase': 'Bereitstellung mit Firebase und CPanel',
            'firebase_deploy': 'Bereitstellung mit Firebase und CPanel',
            'springboot_use': 'Verwendung von Spring Boot und seinen Modulen (Thymeleaf, Security und Datenbank)',
            'wordpress_training': 'Nutzung und Schulung in WordPress mit Elementor',
            'intellij_use': 'Verwendung von IntelliJ IDEA und Java',
            'phpmyadmin_use': 'Datenbanknutzung mit PHP MyAdmin und XAMPP',
            'vscode_use': 'Verwendung von Visual Studio Code (HTML, CSS und JavaScript)',
            'bootstrap_use': 'Verwendung von Bootstrap',
            'daw_course': 'Höherer Studiengang in (DAW) Webanwendungsentwicklung',
            'netbeans_java': 'Apache NetBeans und Java',
            'windows_software': 'Nutzung von Windows-Software',
            'linux_software': 'Nutzung von Software verschiedener Linux-Distributionen',
            'command_line': 'Verwendung der Befehlszeile in Windows und verschiedenen Linux-Distributionen',
            'virtualbox_use': 'Verwendung virtueller Maschinen mit VirtualBox',
            'vscode_php': 'Verwendung von Visual Studio Code (HTML, CSS und PHP)',
            'mysql_use': 'Verwendung von MySQL Server',
            'hardware_knowledge': 'Kenntnisse über interne Computerhardware',
            'administration': 'Verwaltung',
            'typing_course': 'Mittlerer Kurs in Maschinenschreiben und Computerprogrammen',
            'windows': 'Windows',
            'sol_software': 'SOL-Software',
            'office_package': 'Office-Paket',
            'typing': 'Maschinenschreiben',
            'basic_degree': 'Grundausbildungsabschluss / ESO',
            'secondary_education': 'Obligatorische Sekundarschulbildung',
            'basic_admin_course': 'Grundberufsausbildung in Verwaltung',
            'technical_skills': 'Technisch',
            'windows_systems': 'Windows-Systeme',
            'paqute_office': 'Office-Paket',
            'software_sol': 'SOL-Software',
            'bios_config': 'BIOS-Konfiguration',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'php': 'PHP',
            'bdd': 'Datenbanken',
            'vbox': 'VirtualBox',
            'componentes_hardware': 'Hardware-Komponenten',
            'personal_skills': 'Persönlich',
            'responsible': 'Verantwortungsbewusst und pünktlich',
            'organized': 'Organisiert',
            'resolute': 'Entschlossen',
            'teamwork': 'Fähigkeit zur Teamarbeit',
            'good_presence': 'Gutes Auftreten und Umgang',
            'spanish_native': 'Spanisch (Muttersprache)',
            'english_b1': 'Englisch (B1)',
            'disability': 'Anerkannte Behinderung von 40%',
            'politics_interest': 'Interesse an nationaler und internationaler Politik',
            'portfolio_available': 'Portfolio verfügbar auf',
            'connect_with_me': 'Verbinden Sie sich mit mir',
            'quick_links': 'Schnelllinks',
            'my_portfolio': 'Mein Portfolio',
            'contact': 'Kontakt',
            'all_rights': 'Alle Rechte vorbehalten.',
            'internship_li1': 'Ich habe die SEO-Optimierung wichtiger Webseiten, einschließlich der Kontaktseite, zur Verbesserung der Online-Sichtbarkeit durchgeführt.',
            'internship_li2': 'Ich habe Datenbanken in Excel verwaltet und aktualisiert, um eine korrekte Klassifizierung und Filterung von Kursinformationen und Mitarbeiterzugang zu gewährleisten.',
            'internship_li3': 'Ich habe Änderungen und Aktualisierungen auf digitalen Plattformen implementiert, einschließlich der Platzierung von Dateien in "Código Ágora" und der Aktualisierung von Berufszertifikaten der Website.',
            'internship_li4': 'Ich habe bei der Lösung von Vorfällen im Zusammenhang mit Dokumentation und Dateispeicherung in internen Systemen zusammengearbeitet.',
            'internship_li5': 'Ich habe bei der Vorbereitung und Organisation von Daten für Schulungskurse unterstützt und das Informationsmanagement optimiert.',
            'internship_li6': 'Ich habe aktiv an der abteilungsübergreifenden Kommunikation teilgenommen, um Aufgaben zu koordinieren und den reibungslosen Ablauf digitaler Projekte zu gewährleisten.',
            'admin_li1': 'Ich habe den Service für die Betreuung und Steuerung der Entladung von Transportunternehmen in einem Unternehmen, das sich mit der Destillation von Wein befasst, verwaltet.',
            'admin_li2': 'Ich habe mit Lieferanten unter Verwendung eines unternehmenseigenen Programms für die Operationsverwaltung interagiert.',
            'admin_li3': 'Ich habe eine tägliche Eingangskontrolle in einer Excel-Datei geführt und die Menge der empfangenen Liter, Daten des Lieferunternehmens, Informationen des Transporteurs und die von Montag bis Freitag kumulierte Gesamtmenge erfasst.',
            'admin_li4': 'Ich habe Excel-Aufzeichnungen gedruckt und anschließend Liter, Lieferanten und Kennzeichen der Transporteure in ein Lagerverwaltungsblatt übertragen, das sowohl eingehende als auch ausgehende Liter detailliert darstellte.',
            'admin_li5': 'Ich habe am Etikettierungsprozess für Wein mitgewirkt, bei dem Proben aus bestimmten Lagern zur weiteren Analyse entnommen wurden. Ich habe keine Labortests durchgeführt, war aber an der Vorbereitungs- und Logistikphase der Proben beteiligt.',
            'admin_li6': 'Ich habe die Logistik und Vorbereitung von Weinproben für Qualitätstests unterstützt und deren ordnungsgemäße Identifizierung und Rückverfolgbarkeit sichergestellt.',
            'basic_admin_li1': 'Ich habe eine detaillierte Unternehmenspräsentation für potenzielle Kunden entwickelt und präsentiert, die von der Unternehmensidentifikation bis zu Verbesserungsstrategien und neuen Technologien reichte.',
            'basic_admin_li2': 'Ich habe wesentliche administrative Aufgaben verwaltet, einschließlich der Erstellung des jährlichen Arbeitskalenders mit nationalen und lokalen Feiertagen und der Erstellung von Excel-Vorlagen für die Erfassung von ausgestellten und erhaltenen Rechnungen.',
            'basic_admin_li3': 'Ich habe die Archivierung von Kundenrechnungen aus dem Jahr 2019 organisiert und ein numerisches Klassifizierungskriterium angewendet.',
            'basic_admin_li4': 'Ich habe interne Mitteilungen (Memoranden) und externe Mitteilungen (Reklamationsschreiben für beschädigtes Material) verfasst und dabei professionelle Kommunikationsfähigkeiten unter Beweis gestellt.',
            'basic_admin_li5': 'Ich habe zur Festlegung von Geschäftsprotokollnormen, sowohl sozialer als auch arbeitsbezogener Art, beigetragen und einen Zehn-Punkte-Katalog zur Prävention von Berufsrisiken entwickelt, der an die COVID-19-Situation angepasst war.',
            'basic_admin_li6': 'Ich habe den Empfang von Kundenanrufen bearbeitet, Nachrichten notiert und die Nachverfolgung mit der Geschäftsleitung koordiniert.'
        },

        'it': {
            'page_title': 'Pedro Ortiz Plaza - CV Professionale',
            'header_title': 'Pedro Ortiz Plaza',
            'header_subtitle': 'Amministrativo & Programmatore di Sistemi',
            'location': 'Castiglia-La Mancia, Spagna',
            'menu_experience': 'Esperienza',
            'menu_education': 'Formazione',
            'menu_skills': 'Competenze',
            'menu_other': 'Altre informazioni',
            'menu_language': 'Lingua',
            'download_cv': 'Scarica CV',
            'experience_title': 'Esperienza Professionale',
            'internship_title': 'Tirocinio di Formazione Professionale',
            'internship_description': 'Programmazione di Sistemi - CEAT. Tirocinio di 120 ore.',
            'admin_degree': 'Alcomasa - 520 ore di tirocinio in Amministrazione',
            'basic_admin': 'Tirocini virtuali - 520 ore di tirocinio',
            'systems_programming_degree': 'Titolo di Formazione di Livello 3 in Programmazione di Sistemi Informatici',
            'equivalent_degree': 'Programmazione di Sistemi, equivalente a un diploma superiore',
            'ceat_course': 'CEAT - Programmazione di Sistemi Informatici',
            'despliegue_firebase': 'Distribuzione con Firebase e CPanel',
            'firebase_deploy': 'Distribuzione con Firebase e CPanel',
            'springboot_use': 'Uso di Spring Boot e suoi moduli (Thymeleaf, Security e database)',
            'wordpress_training': 'Uso e formazione in WordPress con Elementor',
            'intellij_use': 'Uso di IntelliJ IDEA e Java',
            'phpmyadmin_use': 'Uso di database con PHP MyAdmin e XAMPP',
            'vscode_use': 'Uso di Visual Studio Code (HTML, CSS e JavaScript)',
            'bootstrap_use': 'Uso di Bootstrap',
            'daw_course': 'Corso di diploma superiore in (DAW) Sviluppo di Applicazioni Web',
            'netbeans_java': 'Apache NetBeans e Java',
            'windows_software': 'Uso di software Windows',
            'linux_software': 'Uso di software di diverse distribuzioni Linux',
            'command_line': 'Uso della riga di comando in Windows e diverse distribuzioni Linux',
            'virtualbox_use': 'Uso di macchine virtuali con VirtualBox',
            'vscode_php': 'Uso di Visual Studio Code (HTML, CSS e PHP)',
            'mysql_use': 'Uso di MySQL Server',
            'hardware_knowledge': 'Conoscenze sull\'hardware interno dei computer',
            'administration': 'Amministrazione',
            'typing_course': 'Corso di diploma medio in dattilografia e programmi informatici',
            'windows': 'Windows',
            'sol_software': 'Software SOL',
            'office_package': 'Pacchetto Office',
            'typing': 'Dattilografia',
            'basic_degree': 'Titolo di Formazione di Base / ESO',
            'secondary_education': 'Istruzione Secondaria Obbligatoria',
            'basic_admin_course': 'Formazione Professionale di Base in Amministrazione',
            'technical_skills': 'Tecniche',
            'windows_systems': 'Sistemi Windows',
            'paqute_office': 'Pacchetto Office',
            'software_sol': 'Software SOL',
            'bios_config': 'Configurazione BIOS',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'php': 'PHP',
            'bdd': 'Basi di dati',
            'vbox': 'VirtualBox',
            'componentes_hardware': 'Componenti Hardware',
            'personal_skills': 'Personali',
            'responsible': 'Responsabile e puntuale',
            'organized': 'Organizzato',
            'resolute': 'Risoluto',
            'teamwork': 'Capacità di lavorare in team',
            'good_presence': 'Buona presenza e trattamento',
            'spanish_native': 'Spagnolo (Madrelingua)',
            'english_b1': 'Inglese (B1)',
            'disability': 'Disabilità riconosciuta del 40%',
            'politics_interest': 'Interesse per la politica nazionale e internazionale',
            'portfolio_available': 'Portfolio disponibile su',
            'connect_with_me': 'Connettiti con me',
            'quick_links': 'Link rapidi',
            'my_portfolio': 'Il mio Portfolio',
            'contact': 'Contatto',
            'all_rights': 'Tutti i diritti riservati.',
            'internship_li1': 'Ho eseguito l\'ottimizzazione SEO delle pagine web chiave, inclusa la pagina dei contatti, per migliorare la visibilità online.',
            'internship_li2': 'Ho gestito e aggiornato database in Excel, assicurando la corretta classificazione e filtraggio delle informazioni sui corsi e l\'accesso dei lavoratori.',
            'internship_li3': 'Ho implementato modifiche e aggiornamenti su piattaforme digitali, incluso il posizionamento di file in "Código Ágora" e l\'aggiornamento dei certificati di professionalità del sito.',
            'internship_li4': 'Ho collaborato alla risoluzione di incidenti relativi alla documentazione e alla localizzazione dei file nei sistemi interni.',
            'internship_li5': 'Ho supportato la preparazione e l\'organizzazione dei dati per i corsi di formazione, ottimizzando la gestione delle informazioni.',
            'internship_li6': 'Ho partecipato attivamente alla comunicazione interdepartmentale per coordinare le attività e garantire la fluidità dei progetti digitali.',
            'admin_li1': 'Ho gestito il servizio di attenzione e direzione dello scarico degli autotrasportatori in un\'azienda dedicata alla distillazione di vini.',
            'admin_li2': 'Ho interagito con i fornitori utilizzando un programma proprietario dell\'azienda per la gestione delle operazioni.',
            'admin_li3': 'Ho mantenuto un controllo giornaliero degli ingressi in un file Excel, registrando la quantità di litri ricevuti, i dati dell\'azienda fornitrice, le informazioni dell\'autotrasportatore e il totale accumulato da lunedì a venerdì.',
            'admin_li4': 'Ho stampato i registri di Excel e successivamente trascritto i litri, i fornitori e le targhe degli autotrasportatori in un foglio di gestione magazzino che dettagliava sia i litri in entrata che in uscita.',
            'admin_li5': 'Ho collaborato nel processo di etichettatura dei vini, dove venivano prelevati campioni da determinati magazzini per successive analisi. Non ho eseguito i test di laboratorio, ma ho partecipato alla fase di preparazione e logistica dei campioni.',
            'admin_li6': 'Ho supportato la logistica e la preparazione di campioni di vino per test di qualità, garantendone la corretta identificazione e tracciabilità.',
            'basic_admin_li1': 'Ho sviluppato e presentato una presentazione aziendale dettagliata per clienti potenziali, che spaziava dall\'identificazione dell\'azienda a strategie di miglioramento e nuove tecnologie.',
            'basic_admin_li2': 'Ho gestito compiti amministrativi essenziali, inclusa la preparazione del calendario lavorativo annuale con festività nazionali e locali, e la creazione di modelli in Excel per la registrazione di fatture emesse e ricevute.',
            'basic_admin_li3': 'Ho organizzato l\'archivio delle fatture clienti del 2019, applicando un criterio numerico di classificazione.',
            'basic_admin_li4': 'Ho redatto comunicazioni interne (memorandum) ed esterne (lettere di reclamo per materiale in cattive condizioni), dimostrando abilità di comunicazione professionale.',
            'basic_admin_li5': 'Ho contribuito all\'istituzione di norme di protocollo aziendale, sia sociali che lavorative, e ho sviluppato un decalogo di Prevenzione dei Rischi Professionali adattato alla situazione COVID-19.',
            'basic_admin_li6': 'Ho gestito la ricezione di chiamate da clienti, prendendo nota dei messaggi e coordinando il follow-up con la direzione.'
        },

        'pt': {
            'page_title': 'Pedro Ortiz Plaza - Currículo Profissional',
            'header_title': 'Pedro Ortiz Plaza',
            'header_subtitle': 'Administrativo & Programador de Sistemas',
            'location': 'Castilla-La Mancha, Espanha',
            'menu_experience': 'Experiência',
            'menu_education': 'Formação',
            'menu_skills': 'Habilidades',
            'menu_other': 'Outras informações',
            'menu_language': 'Idioma',
            'download_cv': 'Baixar CV',
            'experience_title': 'Experiência Profissional',
            'internship_title': 'Estágio de Formação Profissional',
            'internship_description': 'Programação de Sistemas - CEAT. Estágio com 120 horas.',
            'admin_degree': 'Alcomasa - 520 horas de estágio',
            'basic_admin': 'Estágios Virtuais - 520 horas de estágio',
            'systems_programming_degree': 'Título de Formação de Nível 3 em Programação de Sistemas Informáticos',
            'equivalent_degree': 'Programação de Sistemas, equivalente a um diploma superior',
            'ceat_course': 'CEAT - Programação de Sistemas Informáticos',
            'despliegue_firebase': 'Implantaçao com Firebase e CPanel',
            'firebase_deploy': 'Implantaçao com Firebase e CPanel',
            'springboot_use': 'Uso de Spring Boot e seus módulos (Thymeleaf, Security e banco de dados)',
            'wordpress_training': 'Uso e formação em WordPress com Elementor',
            'intellij_use': 'Uso de IntelliJ IDEA e Java',
            'phpmyadmin_use': 'Uso de banco de dados com PHP MyAdmin e XAMPP',
            'vscode_use': 'Uso de Visual Studio Code (HTML, CSS e JavaScript)',
            'bootstrap_use': 'Uso de Bootstrap',
            'daw_course': 'Curso de diploma superior em (DAW) Desenvolvimento de Aplicações Web',
            'netbeans_java': 'Apache NetBeans e Java',
            'windows_software': 'Uso de software Windows',
            'linux_software': 'Uso de software de diferentes distribuições Linux',
            'command_line': 'Uso da linha de comando no Windows e diferentes distribuições Linux',
            'virtualbox_use': 'Uso de máquinas virtuais com VirtualBox',
            'vscode_php': 'Uso de Visual Studio Code (HTML, CSS e PHP)',
            'mysql_use': 'Uso de MySQL Server',
            'hardware_knowledge': 'Conhecimentos sobre hardware interno de computadores',
            'administration': 'Administração',
            'typing_course': 'Curso de nível médio em datilografia e programas de computador',
            'windows': 'Windows',
            'sol_software': 'Software SOL',
            'office_package': 'Pacote Office',
            'typing': 'Datilografia',
            'basic_degree': 'Título de Formação Básica / ESO',
            'secondary_education': 'Educação Secundária Obrigatória',
            'basic_admin_course': 'Formação Profissional Básica em Administração',
            'technical_skills': 'Técnicas',
            'windows_systems': 'Sistemas Windows',
            'paqute_office': 'Pacote Office',
            'software_sol': 'Software SOL',
            'bios_config': 'Configuração BIOS',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'JavaScript',
            'php': 'PHP',
            'bdd': 'Bancos de dados',
            'vbox': 'VirtualBox',
            'componentes_hardware': 'Componentes de Hardware',
            'personal_skills': 'Pessoais',
            'responsible': 'Responsável e pontual',
            'organized': 'Organizado',
            'resolute': 'Resoluto',
            'teamwork': 'Capacidade de trabalhar em equipe',
            'good_presence': 'Boa presença e tratamento',
            'spanish_native': 'Espanhol (Nativo)',
            'english_b1': 'Inglês (B1)',
            'disability': 'Deficiência reconhecida de 40%',
            'politics_interest': 'Interesse em política nacional e internacional',
            'portfolio_available': 'Portfólio disponível em',
            'connect_with_me': 'Conecte-se comigo',
            'quick_links': 'Links rápidos',
            'my_portfolio': 'Meu Portfólio',
            'contact': 'Contato',
            'all_rights': 'Todos os direitos reservados.',
            'internship_li1': 'Realizei a otimização SEO de páginas web chave, incluindo a página de contato, para melhorar a visibilidade online.',
            'internship_li2': 'Gerenciei e atualizei bancos de dados no Excel, garantindo a classificação e filtragem corretas das informações de cursos e acesso para trabalhadores.',
            'internship_li3': 'Implementei mudanças e atualizações em plataformas digitais, incluindo a colocação de arquivos em "Código Ágora" e a atualização de certificados de profissionalidade do site.',
            'internship_li4': 'Colaborei na resolução de incidentes relacionados à documentação e localização de arquivos em sistemas internos.',
            'internship_li5': 'Apoiei na preparação e organização de dados para cursos de formação, otimizando a gestão de informações.',
            'internship_li6': 'Participei ativamente na comunicação interdepartamental para coordenar tarefas e garantir a fluidez dos projetos digitais.',
            'admin_li1': 'Gerenciei o serviço de atendimento e direção de descarga de transportadoras em uma empresa dedicada à destilação de vinhos.',
            'admin_li2': 'Interagi com fornecedores utilizando um programa próprio da empresa para a gestão das operações.',
            'admin_li3': 'Mantive um controle diário de entradas em um arquivo Excel, registrando a quantidade de litros recebidos, dados da empresa fornecedora, informações do transportador e o total acumulado de segunda a sexta-feira.',
            'admin_li4': 'Realizei a impressão dos registros do Excel e a posterior transcrição de litros, fornecedores e matrículas de transportadoras para uma folha de gestão de armazém que detalhava tanto os litros que entravam quanto os que saíam.',
            'admin_li5': 'Colaborei no processo de rotulagem de vinhos, onde eram extraídas amostras de determinados armazéns para posterior análise. Não realizei os testes laboratoriais, mas participei da fase de preparação e logística das amostras.',
            'admin_li6': 'Apoiei na logística e preparação de amostras de vinho para testes de qualidade, garantindo sua correta identificação e rastreabilidade.',
            'basic_admin_li1': 'Desenvolvi e apresentei uma apresentação empresarial detalhada para clientes potenciais, abrangendo desde a identificação da empresa até estratégias de melhoria e novas tecnologias.',
            'basic_admin_li2': 'Gerenciei tarefas administrativas essenciais, incluindo a elaboração do calendário laboral anual com feriados nacionais e locais, e a criação de modelos no Excel para o registro de faturas emitidas e recebidas.',
            'basic_admin_li3': 'Organizei o arquivo de faturas de clientes de 2019, aplicando um critério numérico de classificação.',
            'basic_admin_li4': 'Redigi comunicações internas (memorandos) e externas (cartas de reclamação por material em mau estado), demonstrando habilidades de comunicação profissional.',
            'basic_admin_li5': 'Contribuí para o estabelecimento de normas de protocolo empresarial, tanto sociais como laborais, e desenvolvi um decálogo de Prevenção de Riscos Laborais adaptado à situação da COVID-19.',
            'basic_admin_li6': 'Gerenciei a recepção de chamadas de clientes, tomando nota das mensagens e coordenando o acompanhamento com a direção.'
        },

        'ru': {
            'page_title': 'Педро Ортис Пласа - Профессиональное резюме',
            'header_title': 'Педро Ортис Пласа',
            'header_subtitle': 'Администратор и программист систем',
            'location': 'Кастилия-Ла-Манча, Испания',
            'menu_experience': 'Опыт работы',
            'menu_education': 'Образование',
            'menu_skills': 'Навыки',
            'menu_other': 'Другая информация',
            'menu_language': 'Язык',
            'download_cv': 'Скачать резюме',
            'experience_title': 'Профессиональный опыт',
            'internship_title': 'Профессиональная стажировка',
            'internship_description': 'Программирование систем - CEAT. Стажировка продолжительностью 120 часов.',
            'admin_degree': 'Alcomasa - 520 часов практики',
            'basic_admin': 'Виртуальная практика - 520 часов практики',
            'systems_programming_degree': 'Квалификация 3-го уровня по программированию компьютерных систем',
            'equivalent_degree': 'Программирование систем, эквивалентное высшему образованию',
            'ceat_course': 'CEAT - Программирование компьютерных систем',
            'despliegue_firebase': 'Развертывание с Firebase и CPanel',
            'firebase_deploy': 'Развертывание с Firebase и CPanel',
            'springboot_use': 'Использование Spring Boot и его модулей (Thymeleaf, Security и база данных)',
            'wordpress_training': 'Использование и обучение WordPress с Elementor',
            'intellij_use': 'Использование IntelliJ IDEA и Java',
            'phpmyadmin_use': 'Использование баз данных с PHP MyAdmin и XAMPP',
            'vscode_use': 'Использование Visual Studio Code (HTML, CSS и JavaScript)',
            'bootstrap_use': 'Использование Bootstrap',
            'daw_course': 'Курс высшего образования по (DAW) разработке веб-приложений',
            'netbeans_java': 'Apache NetBeans и Java',
            'windows_software': 'Использование программного обеспечения Windows',
            'linux_software': 'Использование программного обеспечения различных дистрибутивов Linux',
            'command_line': 'Использование командной строки в Windows и различных дистрибутивах Linux',
            'virtualbox_use': 'Использование виртуальных машин с VirtualBox',
            'vscode_php': 'Использование Visual Studio Code (HTML, CSS и PHP)',
            'mysql_use': 'Использование MySQL Server',
            'hardware_knowledge': 'Знания о внутреннем оборудовании компьютеров',
            'administration': 'Администрирование',
            'typing_course': 'Средний курс машинописи и компьютерных программ',
            'windows': 'Windows',
            'sol_software': 'Программное обеспечение SOL',
            'office_package': 'Офисный пакет',
            'typing': 'Машинопись',
            'basic_degree': 'Базовый уровень образования / ESO',
            'secondary_education': 'Обязательное среднее образование',
            'basic_admin_course': 'Базовая профессиональная подготовка по администрированию',
            'technical_skills': 'Технические',
            'windows_systems': 'Системы Windows',
            'paqute_office': 'Офисный пакет',
            'software_sol': 'Программное обеспечение SOL',
            'bios_config': 'Конфигурация BIOS',
            'java': 'Java',
            'html': 'HTML',
            'css': 'CSS',
            'js': 'ЯВАСКРИПТ',
            'php': 'PHP',
            'bdd': 'Базы данных',
            'vbox': 'ВИРТУАЛЬНЫЙ БОКС',
            'componentes_hardware': 'Аппаратные компоненты',
            'personal_skills': 'Личные',
            'responsible': 'Ответственный и пунктуальный',
            'organized': 'Организованный',
            'resolute': 'Решительный',
            'teamwork': 'Способность работать в команде',
            'good_presence': 'Хорошее присутствие и обращение',
            'spanish_native': 'Испанский (родной)',
            'english_b1': 'Английский (B1)',
            'disability': 'Признанная инвалидность 40%',
            'politics_interest': 'Интерес к национальной и международной политике',
            'portfolio_available': 'Портфолио доступно на',
            'connect_with_me': 'Свяжитесь со мной',
            'quick_links': 'Быстрые ссылки',
            'my_portfolio': 'Мое портфолио',
            'contact': 'Контакт',
            'all_rights': 'Все права защищены.',
            'internship_li1': 'Я выполнил SEO-оптимизацию ключевых веб-страниц, включая страницу контактов, для улучшения онлайн-видимости.',
            'internship_li2': 'Я управлял и обновлял базы данных в Excel, обеспечивая правильную классификацию и фильтрацию информации о курсах и доступе для работников.',
            'internship_li3': 'Я реализовал изменения и обновления на цифровых платформах, включая размещение файлов в "Código Ágora" и обновление сертификатов профессиональности сайта.',
            'internship_li4': 'Я сотрудничал в решении инцидентов, связанных с документацией и локализацией файлов во внутренних системах.',
            'internship_li5': 'Я поддерживал подготовку и организацию данных для учебных курсов, оптимизируя управление информацией.',
            'internship_li6': 'Я активно участвовал в межведомственной коммуникации для координации задач и обеспечения плавности цифровых проектов.',
            'admin_li1': 'Я управлял службой обслуживания и направления разгрузки перевозчиков в компании, занимающейся дистилляцией вин.',
            'admin_li2': 'Я взаимодействовал с поставщиками, используя собственную программу компании для управления операциями.',
            'admin_li3': 'Я вел ежедневный контроль записей в файле Excel, регистрируя количество полученных литров, данные компании-поставщика, информацию о перевозчике и общее накопленное значение с понедельника по пятницу.',
            'admin_li4': 'Я распечатывал записи Excel и затем переносил литры, поставщиков и номера транспортных средств в ведомость управления складом, где подробно описывались как входящие, так и исходящие литры.',
            'admin_li5': 'Я участвовал в процессе маркировки вин, где образцы отбирались из определенных складов для последующего анализа. Я не проводил лабораторные tests, но участвовал в фазе подготовки и логистики образцов.',
            'admin_li6': 'Я поддерживал логистику и подготовку образцов вина для тестов качества, обеспечивая их правильную идентификацию и прослеживаемость.',
            'basic_admin_li1': 'Я разработал и представил подробную бизнес-презентацию для потенциальных клиентов, охватывающую от идентификации компании до стратегий улучшения и новых технологий.',
            'basic_admin_li2': 'Я управлял основными административными задачами, включая подготовку ежегодного рабочего календаря с национальными и местными праздниками, и создание шаблонов в Excel для регистрации выставленных и полученных счетов.',
            'basic_admin_li3': 'Я организовал архив счетов клиентов за 2019 год, применив числовой критерий классификации.',
            'basic_admin_li4': 'Я составлял внутренние коммуникации (меморандумы) и внешние коммуникации (письма с претензиями на поврежденный материал), демонстрируя профессиональные коммуникативные навыки.',
            'basic_admin_li5': 'Я внес вклад в установление норм делового протокола, как социальных, так и трудовых, и разработал декалог по профилактике профессиональных рисков, адаптированный к ситуации с COVID-19.',
            'basic_admin_li6': 'Я обрабатывал прием звонков от клиентов, записывал сообщения и координировал последующие действия с руководством.'
        },

    'zh': {
        'page_title': '佩德罗·奥尔蒂斯·普拉萨 - 专业简历',
        'header_title': '佩德罗·奥尔蒂斯·普拉萨',
        'header_subtitle': '行政与系统程序员',
        'location': '卡斯蒂利亚-拉曼查, 西班牙',
        'menu_experience': '工作经验',
        'menu_education': '教育',
        'menu_skills': '技能',
        'menu_other': '其他信息',
        'menu_language': '语言',
        'download_cv': '下载简历',
        'experience_title': '专业经验',
        'internship_title': '职业培训实习',
        'internship_description': '系统编程 - CEAT。实习时间为120小时。',
        'admin_degree': 'Alcomasa - 520小时实习',
        'basic_admin': '虚拟实习 - 520小时实习',
        'systems_programming_degree': '计算机系统编程3级培训证书',
        'equivalent_degree': '系统编程，相当于高等学位',
        'ceat_course': 'CEAT - 计算机系统编程',
        'despliegue_firebase': '使用Firebase和CPanel部署',
        'firebase_deploy': '使用Firebase和CPanel部署',
        'springboot_use': '使用Spring Boot及其模块（Thymeleaf、Security和数据库）',
        'wordpress_training': '使用和培训WordPress与Elementor',
        'intellij_use': '使用IntelliJ IDEA和Java',
        'phpmyadmin_use': '使用PHP MyAdmin和XAMPP进行数据库操作',
        'vscode_use': '使用Visual Studio Code（HTML、CSS和JavaScript）',
        'bootstrap_use': '使用Bootstrap',
        'daw_course': '高等课程（DAW）Web应用开发',
        'netbeans_java': 'Apache NetBeans和Java',
        'windows_software': '使用Windows软件',
        'linux_software': '使用不同Linux发行版的软件',
        'command_line': '在Windows和不同Linux发行版中使用命令行',
        'virtualbox_use': '使用VirtualBox虚拟机',
        'vscode_php': '使用Visual Studio Code（HTML、CSS和PHP）',
        'mysql_use': '使用MySQL Server',
        'hardware_knowledge': '关于计算机内部硬件的知识',
        'administration': '行政管理',
        'typing_course': '中级打字和计算机程序课程',
        'windows': 'Windows',
        'sol_software': 'SOL软件',
        'office_package': '办公套件',
        'typing': '打字',
        'basic_degree': '基础教育证书 / ESO',
        'secondary_education': '义务教育',
        'basic_admin_course': '基础行政管理职业培训',
        'technical_skills': '技术',
        'windows_systems': 'Windows系统',
        'paqute_office': '办公套件',
        'software_sol': 'SOL软件',
        'bios_config': 'BIOS配置',
        'java': 'Java',
        'html': 'HTML',
        'css': 'CSS',
        'js': 'JavaScript',
        'php': 'PHP',
        'bdd': '数据库',
        'vbox': 'VirtualBox',
        'componentes_hardware': '硬件组件',
        'personal_skills': '个人',
        'responsible': '负责和准时',
        'organized': '有条理',
        'resolute': '果断',
        'teamwork': '团队合作能力',
        'good_presence': '良好的形象和待人接物',
        'spanish_native': '西班牙语（母语）',
        'english_b1': '英语（B1）',
        'disability': '认可的40%残疾',
        'politics_interest': '对国家和国际政治的兴趣',
        'portfolio_available': '作品集可在',
        'connect_with_me': '与我联系',
        'quick_links': '快速链接',
        'my_portfolio': '我的作品集',
        'contact': '联系方式',
        'all_rights': '保留所有权利。',
        'internship_li1': '我对关键网页进行了SEO优化，包括联系页面，以提高在线可见性。',
        'internship_li2': '我在Excel中管理和更新数据库，确保课程信息和员工访问权限的正确分类和筛选。',
        'internship_li3': '我在数字平台上实施更改和更新，包括在"Código Ágora"中放置文件以及更新网站的专业证书。',
        'internship_li4': '我合作解决了与文档和内部系统中文件定位相关的事件。',
        'internship_li5': '我支持培训和课程数据的准备和组织，优化信息管理。',
        'internship_li6': '我积极参与部门间沟通，协调任务并确保数字项目的流畅进行。',
        'admin_li1': '我在一家专门从事葡萄酒蒸馏的公司管理运输商的装卸服务和指导。',
        'admin_li2': '我使用公司特定的程序与供应商互动以管理运营。',
        'admin_li3': '我在Excel文件中保持每日输入记录，记录收到的升数、供应商公司数据、运输商信息以及周一到周五的累计总量。',
        'admin_li4': '我打印Excel记录，随后将升数、供应商和运输商车牌转录到仓库管理表中，详细说明进出升数。',
        'admin_li5': '我参与了葡萄酒标签过程，从特定仓库提取样品进行后续分析。我没有进行实验室测试，但参与了样品的准备和物流阶段。',
        'admin_li6': '我支持葡萄酒样品的物流和准备以进行质量测试，确保其正确的识别和可追溯性。',
        'basic_admin_li1': '我为潜在客户开发并展示了详细的企业演示，从公司识别到改进策略和新技术。',
        'basic_admin_li2': '我管理基本的行政任务，包括制定带有国家和地方假日的年度工作日历，以及创建Excel模板用于记录发出和收到的发票。',
        'basic_admin_li3': '我整理了2019年客户发票档案，应用了数字分类标准。',
        'basic_admin_li4': '我起草了内部通讯（备忘录）和外部通讯（针对材料损坏的索赔信），展示了专业沟通技巧。',
        'basic_admin_li5': '我为企业协议规范的建立做出了贡献，包括社交和劳动方面，并制定了适应COVID-19情况的职业风险预防十诫。',
        'basic_admin_li6': '我处理客户来电接待，记录消息并与管理层协调跟进。'
    },
    'ja': {
        'page_title': 'ペドロ・オルティス・プラザ - プロフェッショナル履歴書',
        'header_title': 'ペドロ・オルティス・プラザ',
        'header_subtitle': '事務 & システムプログラマー',
        'location': 'カスティーリャ・ラ・マンチャ, スペイン',
        'menu_experience': '職務経験',
        'menu_education': '学歴',
        'menu_skills': 'スキル',
        'menu_other': 'その他の情報',
        'menu_language': '言語',
        'download_cv': '履歴書をダウンロード',
        'experience_title': '職務経験',
        'internship_title': '職業訓練インターンシップ',
        'internship_description': 'システムプログラミング - CEAT。120時間のインターンシップ。',
        'admin_degree': 'Alcomasa - 520時間のインターンシップ',
        'basic_admin': 'バーチャルインターンシップ - 520時間の実習',
        'systems_programming_degree': 'コンピュータシステムプログラミングのレベル3トレーニングタイトル',
        'equivalent_degree': 'システムプログラミング、高等学位に相当',
        'ceat_course': 'CEAT - コンピュータシステムプログラミング',
        'despliegue_firebase': 'FirebaseとCPanelを使用したデプロイ',
        'firebase_deploy': 'FirebaseとCPanelを使用したデプロイ',
        'springboot_use': 'Spring Bootとそのモジュールの使用（Thymeleaf、Security、データベース）',
        'wordpress_training': 'WordPressとElementorの使用とトレーニング',
        'intellij_use': 'IntelliJ IDEAとJavaの使用',
        'phpmyadmin_use': 'PHP MyAdminとXAMPPを使用したデータベース操作',
        'vscode_use': 'Visual Studio Codeの使用（HTML、CSS、JavaScript）',
        'bootstrap_use': 'Bootstrapの使用',
        'daw_course': '高等コース（DAW）ウェブアプリケーション開発',
        'netbeans_java': 'Apache NetBeansとJava',
        'windows_software': 'Windowsソフトウェアの使用',
        'linux_software': 'さまざまなLinuxディストリビューションのソフトウェアの使用',
        'command_line': 'WindowsおよびさまざまなLinuxディストリビューションでのコマンドラインの使用',
        'virtualbox_use': 'VirtualBoxを使用した仮想マシンの使用',
        'vscode_php': 'Visual Studio Codeの使用（HTML、CSS、PHP）',
        'mysql_use': 'MySQL Serverの使用',
        'hardware_knowledge': 'コンピュータ内部ハードウェアに関する知識',
        'administration': '管理',
        'typing_course': '中級タイピングとコンピュータプログラムのコース',
        'windows': 'Windows',
        'sol_software': 'SOLソフトウェア',
        'office_package': 'オフィススイート',
        'typing': 'タイピング',
        'basic_degree': '基礎教育証明書 / ESO',
        'secondary_education': '義務中等教育',
        'basic_admin_course': '基礎管理職業訓練',
        'technical_skills': '技術',
        'windows_systems': 'Windowsシステム',
        'paqute_office': 'オフィススイート',
        'software_sol': 'SOLソフトウェア',
        'bios_config': 'BIOS設定',
        'java': 'Java',
        'html': 'HTML',
        'css': 'CSS',
        'js': 'JavaScript',
        'php': 'PHP',
        'bdd': 'データベース',
        'vbox': 'VirtualBox',
        'componentes_hardware': 'ハードウェアコンポーネント',
        'personal_skills': '個人',
        'responsible': '責任感があり時間厳守',
        'organized': '整理整頓',
        'resolute': '決断力がある',
        'teamwork': 'チームワーク能力',
        'good_presence': '良い印象と対応',
        'spanish_native': 'スペイン語（母国語）',
        'english_b1': '英語（B1）',
        'disability': '認定障害40％',
        'politics_interest': '国内および国際政治への関心',
        'portfolio_available': 'ポートフォリオはこちら',
        'connect_with_me': '連絡する',
        'quick_links': 'クイックリンク',
        'my_portfolio': '私のポートフォリオ',
        'contact': '連絡先',
        'all_rights': '全著作権所有。',
        'internship_li1': '私は連絡先ページを含む主要なウェブページのSEO最適化を行い、オンラインでの可視性を向上させました。',
        'internship_li2': 'Excelでデータベースを管理および更新し、コース情報と従業員のアクセス権限の正しい分類とフィルタリングを確保しました。',
        'internship_li3': '「Código Ágora」へのファイルの配置やサイトの専門資格の更新を含む、デジタルプラットフォームへの変更と更新を実施しました。',
        'internship_li4': '文書や内部システムでのファイルの位置特定に関連する問題の解決に協力しました。',
        'internship_li5': 'トレーニングやコースデータの準備と整理を支援し、情報管理を最適化しました。',
        'internship_li6': '部門間のコミュニケーションに積極的に参加し、タスクを調整し、デジタルプロジェクトの円滑な進行を確保しました。',
        'admin_li1': 'ワイン蒸留に特化した企業で、運送業者の荷降ろしサービスと指示の管理を行いました。',
        'admin_li2': '操作管理のために会社独自のプログラムを使用してサプライヤーと対話しました。',
        'admin_li3': 'Excelファイルで日々の入力を記録し、受け取ったリットル数、サプライヤー企業のデータ、運送業者の情報、月曜日から金曜日までの累計総量を記録しました。',
        'admin_li4': 'Excelの記録を印刷し、その後リットル数、サプライヤー、運送業者のナンバープレートを、入出庫リット数を詳細に記した倉庫管理シートに転記しました。',
        'admin_li5': '特定の倉庫からサンプルを抽出して後続の分析を行うワインラベリングプロセスに協力しました。私は実験室でのテストは行いませんでしたが、サンプルの準備と物流の段階に参加しました。',
        'admin_li6': '品質テストのためのワインサンプルの物流と準備を支援し、正しい識別と追跡可能性を保証しました。',
        'basic_admin_li1': '企業の識別から改善戦略および新技術までをカバーする、潜在的な顧客向けの詳細な企業プレゼンテーションを開発し、発表しました。',
        'basic_admin_li2': '国の祝日と地方の祝日を含む年間労働カレンダーの作成、および発行済みと受領済みの請求書を記録するためのExcelテンプレートの作成を含む、基本的な管理業務を管理しました。',
        'basic_admin_li3': '数値分類基準を適用して、2019年の顧客請求書のファイルを整理しました。',
        'basic_admin_li4': '内部コミュニケーション（メモ）と外部コミュニケーション（不良状態の材料に対するクレームレター）を作成し、専門的なコミュニケーションスキルを示しました。',
        'basic_admin_li5': '社会的および労働の両方における企業プロトコル規範の確立に貢献し、COVID-19状況に適応した労働災害防止の十戒を開発しました。',
        'basic_admin_li6': '顧客からの電話の受付を処理し、メモを取って管理部門とのフォローアップを調整しました。'
    },
    'ar': {
        'page_title': 'بيدرو أورتيز بلازا - السيرة الذاتية المهنية',
        'header_title': 'بيدرو أورتيز بلازا',
        'header_subtitle': 'إداري ومبرمج أنظمة',
        'location': 'كاستيا لا مانتشا، إسبانيا',
        'menu_experience': 'الخبرة',
        'menu_education': 'التعليم',
        'menu_skills': 'المهارات',
        'menu_other': 'معلومات أخرى',
        'menu_language': 'اللغة',
        'download_cv': 'تحميل السيرة الذاتية',
        'experience_title': 'الخبرة المهنية',
        'internship_title': 'تدريب مهني',
        'internship_description': 'برمجة الأنظمة - CEAT. تدريب مدته 120 ساعة.',
        'admin_degree': 'ألكوماسا - 520 ساعة من التدريب العملي',
        'basic_admin': 'تدريب عملي افتراضي - 520 ساعة من التدريب',
        'systems_programming_degree': 'عنوان التدريب من المستوى 3 في برمجة أنظمة الكمبيوتر',
        'equivalent_degree': 'برمجة الأنظمة، تعادل درجة أعلى',
        'ceat_course': 'CEAT - برمجة أنظمة الكمبيوتر',
        'despliegue_firebase': 'النشر باستخدام Firebase وCPanel',
        'firebase_deploy': 'النشر باستخدام Firebase وCPanel',
        'springboot_use': 'استخدام Spring Boot ووحداته (Thymeleaf، Security وقاعدة البيانات)',
        'wordpress_training': 'استخدام وتدريب WordPress مع Elementor',
        'intellij_use': 'استخدام IntelliJ IDEA وJava',
        'phpmyadmin_use': 'استخدام قاعدة البيانات مع PHP MyAdmin وXAMPP',
        'vscode_use': 'استخدام Visual Studio Code (HTML، CSS وJavaScript)',
        'bootstrap_use': 'استخدام Bootstrap',
        'daw_course': 'دورة درجة عليا في (DAW) تطوير تطبيقات الويب',
        'netbeans_java': 'Apache NetBeans وJava',
        'windows_software': 'استخدام برامج Windows',
        'linux_software': 'استخدام برامج توزيعات Linux المختلفة',
        'command_line': 'استخدام سطر الأوامر في Windows وتوزيعات Linux المختلفة',
        'virtualbox_use': 'استخدام الأجهزة الافتراضية مع VirtualBox',
        'vscode_php': 'استخدام Visual Studio Code (HTML، CSS وPHP)',
        'mysql_use': 'استخدام MySQL Server',
        'hardware_knowledge': 'المعرفة حول أجهزة الكمبيوتر الداخلية',
        'administration': 'الإدارة',
        'typing_course': 'دورة متوسطة في الكتابة على الآلة الكاتبة وبرامج الكمبيوتر',
        'windows': 'Windows',
        'sol_software': 'برنامج SOL',
        'office_package': 'حزمة Office',
        'typing': 'الكتابة على الآلة الكاتبة',
        'basic_degree': 'عنوان التدريب الأساسي / ESO',
        'secondary_education': 'التعليم الثانوي الإلزامي',
        'basic_admin_course': 'التدريب المهني الأساسي في الإدارة',
        'technical_skills': 'تقنية',
        'windows_systems': 'أنظمة Windows',
        'paqute_office': 'حزمة Office',
        'software_sol': 'برنامج SOL',
        'bios_config': 'تكوين BIOS',
        'java': 'Java',
        'html': 'HTML',
        'css': 'CSS',
        'js': 'JavaScript',
        'php': 'PHP',
        'bdd': 'قواعد البيانات',
        'vbox': 'VirtualBox',
        'componentes_hardware': 'مكونات الأجهزة',
        'personal_skills': 'شخصية',
        'responsible': 'مسؤول وملتزم بالمواعيد',
        'organized': 'منظم',
        'resolute': 'حازم',
        'teamwork': 'القدرة على العمل ضمن فريق',
        'good_presence': 'حضور جيد ومعاملة',
        'spanish_native': 'الإسبانية (اللغة الأم)',
        'english_b1': 'الإنجليزية (B1)',
        'disability': 'إعاقة معترف بها بنسبة 40٪',
        'politics_interest': 'الاهتمام بالسياسة الوطنية والدولية',
        'portfolio_available': 'المحفظة متاحة على',
        'connect_with_me': 'تواصل معي',
        'quick_links': 'روابط سريعة',
        'my_portfolio': 'محفظتي',
        'contact': 'اتصال',
        'all_rights': 'جميع الحقوق محفوظة.',
        'internship_li1': 'قمت بتحسين محركات البحث لصفحات الويب الرئيسية، بما في ذلك صفحة الاتصال، لتحسين الرؤية عبر الإنترنت.',
        'internship_li2': 'قمت بإدارة وتحديث قواعد البيانات في Excel، وضمان التصنيف والتصفية الصحيحة لمعلومات الدورات والوصول للموظفين.',
        'internship_li3': 'نفذت تغييرات وتحديثات على المنصات الرقمية، بما في ذلك وضع الملفات في "Código Ágora" وتحديث الشهادات المهنية للموقع.',
        'internship_li4': 'تعاونت في حل المشكلات المتعلقة بالتوثيق وتحديد موقع الملفات في الأنظمة الداخلية.',
        'internship_li5': 'دعمت في تحضير وتنظيم البيانات للدورات التدريبية، وتحسين إدارة المعلومات.',
        'internship_li6': 'شاركت بنشاط في التواصل بين الإدارات لتنسيق المهام وضمان سلاسة المشاريع الرقمية.',
        'admin_li1': 'أديرت خدمة استقبال وتوجيه تنزيل الناقلين في شركة متخصصة في تقطير النبيذ.',
        'admin_li2': 'تفاعلت مع الموردين باستخدام برنامج خاص بالشركة لإدارة العمليات.',
        'admin_li3': 'حافظت على سجل يومي للمدخلات في ملف Excel، مسجلاً عدد اللترات المستلمة، وبيانات شركة المورد، ومعلومات الناقل، والمجموع التراكمي من الاثنين إلى الجمعة.',
        'admin_li4': 'قمت بطباعة سجلات Excel ثم نقل اللترات والموردين وأرقام لوحات الناقلين إلى ورقة إدارة المستودعات حيث تم تفصيل اللترات الداخلة والخارجة.',
        'admin_li5': 'تعاونت في عملية وضع العلامات على النبيذ، حيث تم استخراج عينات من مستودعات معينة لتحليلها لاحقًا. لم أجري اختبارات المعمل، لكني شاركت في مرحلة التحضير واللوجستيات للعينات.',
        'admin_li6': 'دعمت في الخدمات اللوجستية وتحضير عينات النبيذ لاختبارات الجودة، وضمان التعريف الصحيح وإمكانية التتبع.',
        'basic_admin_li1': 'طورت وعرضت عرضًا تقديميًا تفصيليًا للشركة للعملاء المحتملين، covering من تعريف الشركة إلى استراتيجيات التحسين والتقنيات الجديدة.',
        'basic_admin_li2': 'أدير المهام الإدارية الأساسية، including إعداد التقويم laborالي السنوي مع العطل الوطنية والمحلية، وإنشاء قوالب في Excel لتسجيل الفواتير الصادرة والواردة.',
        'basic_admin_li3': 'نظمت أرشيف فواتير العملاء لعام 2019، applying معيار التصنيف الرقمي.',
        'basic_admin_li4': 'صغت اتصالات داخلية (مذكرات) وخارجية (خطابات المطالبة due to مواد في حالة سيئة)، demonstrating مهارات الاتصال المهنية.',
        'basic_admin_li5': 'ساهمت في إنشاء معايير البروتوكول التجاري، both الاجتماعية والعملية، ووضعت وثيقة للوقاية من المخاطر laborالية تتلاءم مع وضع COVID-19.',
        'basic_admin_li6': 'تعاملت مع استقبال مكالمات العملاء، وأخذ ملاحظات الرسائل وتنسيق المتابعة مع الإدارة.'
    }
};

    // Función para cambiar el idioma
    function changeLanguage(lang) {
        // Cambiar el atributo lang del html
        document.documentElement.lang = lang;
        
        // Traducir todos los elementos con data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        
        // Actualizar el idioma activo en los botones
        document.querySelectorAll('.language-dropdown-content a').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Guardar el idioma seleccionado
        localStorage.setItem('language', lang);
    }

    // Inicializar el idioma (español por defecto)
    const savedLanguage = localStorage.getItem('language') || 'es';
    changeLanguage(savedLanguage);

    // Manejar clics en los botones de idioma
    document.querySelectorAll('.language-dropdown-content a').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });
});