# 📁 Estructura del Frontend SABU

## 🎯 **Visión General**

El frontend de SABU está organizado en directorios específicos, cada uno con una responsabilidad clara. Esta estructura sigue los principios de "vibe coding" para que los estudiantes puedan entender y modificar el código fácilmente.

## 📂 **Estructura de Directorios**

```
frontend/
├── src/
│   ├── components/     ← 🧩 Componentes de UI
│   ├── hooks/         ← 🎣 Lógica reutilizable
│   ├── lib/           ← 📚 Configuraciones externas
│   ├── config/        ← ⚙️ Variables de entorno
│   └── App.jsx        ← 🚀 Componente principal
```

---

## 🧩 **`components/` - Componentes de Interfaz**

**¿Qué es?** Son las "piezas de LEGO" de la interfaz que se pueden reutilizar.

### **Archivos actuales:**
- **`Login.jsx`** - Formulario de login con Magic Link
- **`Dashboard.jsx`** - Pantalla principal después del login
- **`Onboarding.jsx`** - Formulario de registro de nuevos usuarios

### **Responsabilidades:**
- Renderizar la interfaz de usuario
- Manejar eventos del usuario (clicks, formularios)
- Mostrar datos de forma visual
- Navegación entre pantallas

### **Ejemplo de uso:**
```jsx
// En App.jsx
import Login from './components/Login'
import Dashboard from './components/Dashboard'
```

---

## 🎣 **`hooks/` - Lógica Reutilizable**

**¿Qué es?** Son funciones que contienen lógica que se usa en varios componentes.

### **Archivos actuales:**
- **`useAuth.js`** - Maneja autenticación (login/logout)
- **`useOnboarding.js`** - Maneja el proceso de registro

### **Responsabilidades:**
- Gestionar estado de la aplicación
- Lógica de negocio reutilizable
- Conexión con APIs
- Validaciones de datos

### **Ejemplo de uso:**
```jsx
// En cualquier componente
import { useAuth } from '../hooks/useAuth'

function MiComponente() {
  const { user, signInWithMagicLink } = useAuth()
  // Usar la lógica de autenticación
}
```

---

## 📚 **`lib/` - Librerías Externas**

**¿Qué es?** Son configuraciones y setup de librerías externas.

### **Archivos actuales:**
- **`supabase.js`** - Configuración del cliente de Supabase

### **Responsabilidades:**
- Configurar conexiones externas
- Setup de librerías
- Configuraciones globales
- Clientes de APIs

### **Ejemplo de uso:**
```jsx
// En cualquier archivo
import { supabase } from '../lib/supabase'

// Usar supabase para consultas
const { data } = await supabase.from('usuarios').select('*')
```

---

## ⚙️ **`config/` - Variables de Entorno**

**¿Qué es?** Son archivos de configuración para diferentes entornos.

### **Archivos actuales:**
- **`env.js`** - Configuración de variables de entorno

### **Responsabilidades:**
- Manejar variables de entorno
- Configuraciones por ambiente (desarrollo/producción)
- URLs y claves de APIs
- Configuraciones de la aplicación

### **Ejemplo de uso:**
```jsx
// En cualquier archivo
import { config } from '../config/env'

// Usar configuraciones
const supabaseUrl = config.supabase.url
```

---

## 🚀 **`App.jsx` - Componente Principal**

**¿Qué es?** Es el componente raíz que orquesta toda la aplicación.

### **Responsabilidades:**
- Manejar el routing de la aplicación
- Decidir qué componente mostrar según el estado
- Gestionar la navegación global
- Coordinar entre componentes

### **Flujo de la aplicación:**
1. **Usuario no autenticado** → `Login.jsx`
2. **Usuario autenticado pero sin onboarding** → `Onboarding.jsx`
3. **Usuario completo** → `Dashboard.jsx`

---

## 🎯 **Principios de Organización**

### **1. Una responsabilidad por directorio**
- `components/` = Solo UI
- `hooks/` = Solo lógica
- `lib/` = Solo configuraciones
- `config/` = Solo variables de entorno

### **2. Nombres descriptivos**
- `useAuth.js` = Hook de autenticación
- `Login.jsx` = Componente de login
- `supabase.js` = Cliente de Supabase

### **3. Fácil de encontrar**
- ¿Necesitas cambiar la UI? → `components/`
- ¿Necesitas cambiar la lógica? → `hooks/`
- ¿Necesitas cambiar configuraciones? → `config/`

---

## 🛒 **Ejemplo Práctico: "Agregar Productos al Carrito"**

Vamos a ver cómo se organizaría una funcionalidad real de SABU:

### **🧩 `components/ProductForm.jsx` - La interfaz**
```jsx
// components/ProductForm.jsx
import { useCart } from '../hooks/useCart'

function ProductForm() {
  const { addProduct, loading } = useCart()
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    addProduct({ name: productName, quantity })
  }

  return (
    <div className="p-4">
      <h2>Agregar Producto</h2>
      <form onSubmit={handleSubmit}>
        <input 
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="¿Qué necesitas comprar?"
          className="w-full p-2 border rounded"
        />
        <input 
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded mt-2"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded mt-2"
        >
          {loading ? 'Agregando...' : 'Agregar al carrito'}
        </button>
      </form>
    </div>
  )
}
```

### **🎣 `hooks/useCart.js` - La lógica**
```jsx
// hooks/useCart.js
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCart() {
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState([])

  const addProduct = async (product) => {
    setLoading(true)
    try {
      // Agregar producto a la base de datos
      const { data, error } = await supabase
        .from('carritos')
        .insert([product])
      
      if (error) throw error
      
      // Actualizar el estado local
      setCart([...cart, product])
      alert('¡Producto agregado al carrito!')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  return { cart, addProduct, loading }
}
```

### **🚀 `App.jsx` - El coordinador**
```jsx
// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductForm from './components/ProductForm'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agregar-producto" element={<ProductForm />} />
      </Routes>
    </Router>
  )
}
```

## 🎯 **¿Por qué esta organización?**

### **🧩 `components/ProductForm.jsx`**
- **Responsabilidad:** Mostrar el formulario bonito
- **Contiene:** Inputs, botones, estilos
- **NO contiene:** Lógica de base de datos

### **🎣 `hooks/useCart.js`**
- **Responsabilidad:** Manejar el carrito
- **Contiene:** Funciones para agregar, eliminar, actualizar
- **NO contiene:** Elementos visuales

### **🚀 `App.jsx`**
- **Responsabilidad:** Decidir qué pantalla mostrar
- **Contiene:** Rutas y navegación
- **NO contiene:** Lógica específica de productos

## 📋 **Resumen del ejemplo:**

| Archivo | ¿Qué hace? | ¿Qué contiene? |
|---------|------------|----------------|
| `ProductForm.jsx` | Muestra el formulario | UI, eventos, estado local |
| `useCart.js` | Maneja el carrito | Lógica, API calls, estado global |
| `App.jsx` | Coordina la app | Rutas, navegación |

## ✅ **Ventajas de esta organización:**

1. **`ProductForm.jsx`** se puede reutilizar en otras pantallas
2. **`useCart.js`** se puede usar en cualquier componente
3. **`App.jsx`** mantiene la navegación centralizada
4. **Cada archivo tiene una responsabilidad clara**

---

## 📋 **Resumen General**

| Directorio | ¿Qué contiene? | ¿Cuándo lo uso? |
|------------|----------------|-----------------|
| `components/` | Piezas de interfaz | Para cambiar cómo se ve la app |
| `hooks/` | Lógica reutilizable | Para cambiar cómo funciona la app |
| `lib/` | Configuraciones externas | Para conectar con APIs |
| `config/` | Variables de entorno | Para configurar la app |

**¡Cada directorio tiene un propósito claro y específico!** 🚀
