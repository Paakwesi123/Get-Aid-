import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Heart, 
  Flame, 
  HelpCircle, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Phone
} from 'lucide-react';
// Custom styled components with inline styles
function Button({ children, onClick, variant = "default", size = "default", disabled = false, style = {}, ...props }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    ...style
  };

  const variants = {
    default: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 16px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#374151',
      border: '1px solid #d1d5db',
      padding: '10px 16px',
      backgroundColor: 'white'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      padding: '8px 12px'
    }
  };

  const finalStyle = { ...baseStyle, ...variants[variant] };

  return (
    <button
      style={finalStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.opacity = '0.9';
          e.target.style.transform = 'scale(1.02)';
        }
      } }
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'scale(1)';
        }
      } }
      {...props}
    >
      {children}
    </button>
  );
}

const Card = ({ children, style = {} }) => (
  <div style={{
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    ...style
  }}>
    {children}
  </div>
);

const Textarea = ({ value, onChange, placeholder, style = {} }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    style={{
      display: 'flex',
      minHeight: '80px',
      width: '100%',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      padding: '8px 12px',
      fontSize: '14px',
      outline: 'none',
      resize: 'vertical',
      fontFamily: 'inherit',
      ...style
    }}
  />
);

// Adinkra Symbol Component
const AdinkraSymbol = ({ symbol, style = {} }) => {
  const symbols = {
    'gye-nyame': '✧',
    'sankofa': '⟲',
    'adwo': '※',
    'bi-nka-bi': '◊',
    'fihankra': '◈',
    'mmere-dane': '◉',
    'mate-masie': '◎',
    'epa': '⬟',
    'nyansapo': '✦'
  };
  
  return (
    <div style={{ userSelect: 'none', fontFamily: 'serif', ...style }}>
      {symbols[symbol] || '✧'}
    </div>
  );
};

// Tutorial Component
const Tutorial = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Get-Aid Ghana",
      icon: AlertTriangle,
      adinkra: "gye-nyame",
      content: "Get-Aid Ghana is your emergency response system. In critical situations, we connect you with the right help quickly and efficiently.",
      tip: "Keep your phone charged and location services enabled for fastest response times."
    },
    {
      title: "Emergency Types",
      icon: Heart,
      adinkra: "bi-nka-bi",
      content: "Choose the right emergency type:\n• 🚨 Crime - Security threats, theft, assault\n• 🏥 Health - Medical emergencies, injuries\n• 🔥 Fire - Fire hazards, building evacuation\n• ❓ Unknown - Other urgent situations",
      tip: "When in doubt, choose 'Unknown' - it's better to get help than hesitate."
    },
    {
      title: "Location Sharing",
      icon: MapPin,
      adinkra: "fihankra",
      content: "When you report an emergency, we automatically capture your GPS location to send help to the right place. Your exact coordinates are shared with response teams.",
      tip: "If you're in a building, try to note the floor or room number in your description."
    },
    {
      title: "What Happens Next",
      icon: Clock,
      adinkra: "mmere-dane",
      content: "After reporting:\n1. Your location is captured\n2. Emergency teams are notified\n3. Response team is dispatched\n4. You receive confirmation\n5. Help arrives at your location",
      tip: "Stay in a safe location and keep your phone nearby for updates."
    },
    {
      title: "Safety Tips",
      icon: Shield,
      adinkra: "epa",
      content: "• Stay calm and follow responder instructions\n• Keep emergency contacts updated\n• Don't hang up if called by response teams\n• Move to safety when possible\n• Have backup power for your phone",
      tip: "In extreme danger, call the traditional emergency number 911 immediately."
    }
  ];

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const goNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <Card style={{ maxWidth: '448px', width: '100%' }}>
        <div style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              </div>
              <div>
                <h2 style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{step.title}</h2>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AdinkraSymbol symbol={step.adinkra} style={{ color: '#eab308', fontSize: '20px' }} />
              <Button variant="ghost" onClick={onClose}>
                <X style={{ width: '16px', height: '16px' }} />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  style={{
                    height: '8px',
                    flex: 1,
                    borderRadius: '4px',
                    backgroundColor: index <= currentStep ? '#2563eb' : '#e5e7eb',
                    transition: 'backgroundColor 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              marginBottom: '16px',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line',
              color: '#374151'
            }}>
              {step.content}
            </div>
            
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AdinkraSymbol symbol="nyansapo" style={{ color: '#d97706', fontSize: '14px', marginTop: '2px' }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', color: '#92400e', margin: '0 0 4px 0' }}>Pro Tip</p>
                  <p style={{ fontSize: '12px', color: '#a16207', margin: 0 }}>{step.tip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outline"
              onClick={goPrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft style={{ width: '16px', height: '16px', marginRight: '4px' }} />
              Previous
            </Button>
            
            <Button onClick={goNext}>
              {currentStep === tutorialSteps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Emergency Button Component
const EmergencyButton = ({ emergency, onClick, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getColors = () => {
    switch(emergency.id) {
      case 'crime': return { bg: '#7c3aed', hover: '#6d28d9' };
      case 'health': return { bg: '#2563eb', hover: '#1d4ed8' };
      case 'fire': return { bg: '#dc2626', hover: '#b91c1c' };
      default: return { bg: '#f59e0b', hover: '#d97706' };
    }
  };

  const colors = getColors();

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'left',
        transition: 'all 0.5s ease',
        cursor: 'pointer',
        border: 'none',
        width: '100%',
        backgroundColor: isHovered ? colors.hover : colors.bg,
        transform: isVisible ? (isHovered ? 'scale(1.05)' : 'scale(1)') : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        boxShadow: isHovered ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' : '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <emergency.icon style={{ width: '48px', height: '48px', color: 'white' }} />
          <AdinkraSymbol symbol="gye-nyame" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '32px' }} />
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px', margin: 0 }}>
          {emergency.name}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', margin: 0 }}>
          {emergency.description}
        </p>
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s'
      }} />
    </button>
  );
};

// Loading Screen Component
const LoadingScreen = ({ isLoading, message }) => {
  if (!isLoading) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(37, 99, 235, 0.2)',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <p style={{ color: '#6b7280' }}>{message}</p>
      </div>
    </div>
  );
};

// Adinkra Background Component
const AdinkraBackground = () => (
  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
    <AdinkraSymbol 
      symbol="gye-nyame" 
      style={{ 
        position: 'absolute', 
        top: '80px', 
        left: '40px', 
        color: 'rgba(245, 158, 11, 0.1)', 
        fontSize: '48px', 
        transform: 'rotate(12deg)' 
      }} 
    />
    <AdinkraSymbol 
      symbol="sankofa" 
      style={{ 
        position: 'absolute', 
        top: '160px', 
        right: '80px', 
        color: 'rgba(34, 197, 94, 0.1)', 
        fontSize: '64px', 
        transform: 'rotate(-45deg)' 
      }} 
    />
    <AdinkraSymbol 
      symbol="adwo" 
      style={{ 
        position: 'absolute', 
        bottom: '128px', 
        left: '25%', 
        color: 'rgba(239, 68, 68, 0.1)', 
        fontSize: '40px', 
        transform: 'rotate(45deg)' 
      }} 
    />
    <AdinkraSymbol 
      symbol="gye-nyame" 
      style={{ 
        position: 'absolute', 
        bottom: '80px', 
        right: '40px', 
        color: 'rgba(245, 158, 11, 0.1)', 
        fontSize: '56px', 
        transform: 'rotate(-12deg)' 
      }} 
    />
  </div>
);

// Footer Component
const Footer = () => (
  <footer style={{
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(4px)',
    borderTop: '1px solid rgba(229, 231, 235, 0.3)',
    marginTop: 'auto'
  }}>
    <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <AdinkraSymbol symbol="sankofa" style={{ color: '#f59e0b', fontSize: '16px' }} />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            Built with care for Ghana's emergency response
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
          © 2025 Ghana SOS. Protecting our communities together.
        </p>
      </div>
    </div>
  </footer>
);

// Main SOS Panel Component
const emergencyTypes = [
  {
    id: "crime",
    name: "Crime",
    icon: AlertTriangle,
    description: "Report criminal activity or security threats",
    confirmationMessage: "Help is on the way. Find a safe place to hide. Stay quiet and calm."
  },
  {
    id: "health",
    name: "Health",
    icon: Heart,
    description: "Medical emergencies and health crises",
    confirmationMessage: "Medical team dispatched. Try to stay relaxed. Help is near."
  },
  {
    id: "fire",
    name: "Fire",
    icon: Flame,
    description: "Fire emergencies and rescue situations",
    confirmationMessage: "Firefighters are en route. Evacuate safely if possible."
  },
  {
    id: "unknown",
    name: "Other",
    icon: HelpCircle,
    description: "Other emergency situations",
    confirmationMessage: "Emergency received. Stay alert. Help is on the way."
  }
];

function SOSPanel() {
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Add keyframes for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    // Simulate app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Show tutorial for first-time users (commented out localStorage for this demo)
      // const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      // if (!hasSeenTutorial) {
      //   setShowTutorial(true);
      // }
      setShowTutorial(true); // Always show for demo
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleEmergencySelect = async (emergency) => {
    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);
      setSelectedEmergency(emergency);
    } catch (error) {
      console.error("Failed to get location:", error);
      alert("Unable to access your location. Please enable location services.");
    }
  };

  // Your original sendSOS logic preserved
  const handleSubmitEmergency = async () => {
    if (!selectedEmergency || !location) return;

    setIsSubmitting(true);
    
    try {
      const payload = { 
        latitude: location.lat, 
        longitude: location.lng, 
        type: selectedEmergency.id 
      };

      const res = await fetch('http://localhost:5000/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      setIsConfirmed(true);
      alert(data.message || "SOS sent successfully!");
    } catch (error) {
      alert("Failed to send SOS. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedEmergency(null);
    setDescription("");
    setIsConfirmed(false);
    setLocation(null);
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    // localStorage.setItem('hasSeenTutorial', 'true');
  };

  if (isConfirmed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #dbeafe, #ffffff, #dcfce7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <Card style={{ maxWidth: '448px', width: '100%' }}>
          <div style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <CheckCircle style={{ 
                width: '80px', 
                height: '80px', 
                color: '#16a34a', 
                margin: '0 auto',
                animation: 'pulse 2s infinite'
              }} />
              <AdinkraSymbol symbol="gye-nyame" style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-8px', 
                color: '#eab308' 
              }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Emergency Reported</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>{selectedEmergency?.confirmationMessage}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <MapPin style={{ width: '16px', height: '16px' }} />
                <span>Location captured</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Clock style={{ width: '16px', height: '16px' }} />
                <span>Response team notified</span>
              </div>
            </div>
            <Button onClick={resetForm} style={{ width: '100%' }}>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedEmergency) {
    const getEmergencyColors = () => {
      switch(selectedEmergency.id) {
        case 'crime': return { bg: '#7c3aed', hover: '#6d28d9' };
        case 'health': return { bg: '#2563eb', hover: '#1d4ed8' };
        case 'fire': return { bg: '#dc2626', hover: '#b91c1c' };
        default: return { bg: '#f59e0b', hover: '#d97706' };
      }
    };

    const colors = getEmergencyColors();

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #dbeafe, #ffffff, #faf5ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <Card style={{ maxWidth: '448px', width: '100%' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: colors.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <selectedEmergency.icon style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px' }}>
                Report {selectedEmergency.name} Emergency
              </h2>
              <p style={{ color: '#6b7280', margin: 0 }}>{selectedEmergency.description}</p>
            </div>

            {location && (
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #16a34a',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a' }}>
                  <MapPin style={{ width: '16px', height: '16px' }} />
                  <span>Location captured successfully</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Additional Information (Optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional details about the emergency..."
                style={{ minHeight: '100px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" onClick={() => setSelectedEmergency(null)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEmergency}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  backgroundColor: colors.bg,
                  color: 'white'
                }}
              >
                {isSubmitting ? "Submitting..." : "Send Emergency Report"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen isLoading={true} message="Initializing emergency system..." />;
  }

  return (
    <>
      <Tutorial isOpen={showTutorial} onClose={handleTutorialClose} />
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #dbeafe, #ffffff, #fef3c7)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <AdinkraBackground />
        
        {/* Header */}
        <div style={{
          position: 'relative',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(4px)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)'
        }}>
          <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#2563eb',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Get-Aid Ghana</h1>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Emergency Response System</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Button 
    variant="ghost" 
    onClick={() => setShowTutorial(true)}
    style={{ color: '#6b7280' }}
  >
    <HelpCircle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
    Help
  </Button>
  <AdinkraSymbol symbol="sankofa" style={{ color: '#f59e0b', fontSize: '32px', opacity: 0.3 }} />
</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '48px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }}>
              Emergency Assistance
            </h2>
            <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '512px', margin: '0 auto' }}>
              Get immediate help by selecting the type of emergency. Your location will be shared with emergency responders.
            </p>
          </div>

          {/* Emergency Buttons */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'repeat(2, 1fr)',
  gap: '24px',
  maxWidth: '600px',
  margin: '0 auto'
}}>
            {emergencyTypes.map((emergency, index) => (
              <EmergencyButton
                key={emergency.id}
                emergency={emergency}
                onClick={() => handleEmergencySelect(emergency)}
                delay={index * 100}
              />
            ))}
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center', marginTop: '64px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              In case of immediate danger, call <span style={{ fontWeight: 'bold', color: '#dc2626' }}>911</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
              <AdinkraSymbol symbol="adwo" style={{ color: '#16a34a' }} />
              <span>Powered by Ghana Emergency Services</span>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}

export default SOSPanel;