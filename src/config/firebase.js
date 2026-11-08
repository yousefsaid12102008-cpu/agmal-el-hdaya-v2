
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#060a13">

  <title>AGAML EL HDAYA ERP | مكتبة أجمل الهدايا</title>

  <meta name="description" content="نظام إدارة مكتبة أجمل الهدايا - إدارة المبيعات والمخزون والحسابات والموظفين">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Application Styles -->
  <link rel="stylesheet" href="src/styles/tokens.css">
  <link rel="stylesheet" href="src/styles/global.css">
  <link rel="stylesheet" href="src/styles/components.css">
  <link rel="stylesheet" href="src/styles/layout.css">
  <link rel="stylesheet" href="src/styles/auth.css">
  <link rel="stylesheet" href="src/styles/dashboard.css">
  <link rel="stylesheet" href="src/styles/tables.css">
  <link rel="stylesheet" href="src/styles/print.css">

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #060a13;
      font-family: "Cairo", sans-serif;
    }

    #app {
      min-height: 100vh;
    }

    .app-loader {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 18px;
      color: #e9bd72;
      text-align: center;
    }

    .app-loader-logo {
      font-size: 27px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .app-loader-ring {
      width: 38px;
      height: 38px;
      border: 3px solid #273142;
      border-top-color: #e9bd72;
      border-radius: 50%;
      animation: loader-spin 0.8s linear infinite;
    }

    .app-loader-message {
      color: #aab2c0;
      font-size: 13px;
    }

    @keyframes loader-spin {
      to { transform: rotate(360deg); }
    }

    .app-error {
      max-width: 480px;
      margin: 40px auto;
      padding: 24px;
      color: #ff8585;
      background: #171d29;
      border: 1px solid #693b42;
      border-radius: 14px;
      text-align: center;
    }

    [hidden] {
      display: none !important;
    }
  </style>
</head>

<body>

  <div id="app">

    <!-- Application Loading -->
    <section id="appLoader" class="app-loader">
      <div class="app-loader-logo">
        AGAML EL HDAYA
      </div>

      <div class="app-loader-ring"></div>

      <div class="app-loader-message">
        جاري تشغيل نظام إدارة المكتبة...
      </div>
    </section>

    <!-- Main Application -->
    <main id="appContent" hidden></main>

    <!-- Application Error -->
    <section id="appError" class="app-error" hidden>
      <h2>تعذر تشغيل النظام</h2>
      <p id="appErrorMessage">
        حدث خطأ أثناء تحميل التطبيق.
      </p>
      <button onclick="location.reload()">
        إعادة المحاولة
      </button>
    </section>

  </div>

  <!-- Application Entry Point -->
  <script type="module" src="src/main.js"></script>

</body>
</html>
