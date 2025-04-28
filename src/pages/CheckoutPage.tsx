import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodePayment } from "@/components/payment/QRCodePayment";

// Package type definition
interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  regularPrice: number;
  features: string[];
}

const packages: Package[] = [
    {
    id: "basic",
    name: "Basic Package",
    price: 900,
    description: "1 NSAT exam attempt, Access to free study materials, All subject chapterwise mock tests, ₹900 using referral code",
    color: "primary",
    regularPrice: 900,
    features: []
  },
  {
    id: "premium",
    name: "Premium Package",
    price: 1999,
    description: "1 NSAT exam attempt, Access to free study materials, All subject chapterwise mock tests, 2 live doubt sessions per week, Interview prep session, Free with referral code + ₹200",
    color: "blue",
    regularPrice: 1999,
    features: []
  },
  {
    id: "ultimate",
    name: "Ultimate Package",
    price: 3499,
    description: "1 NSAT exam attempt, Access to free study materials, All subject chapterwise mock tests, Two live doubt sessions per week, 24-hour doubt solution guarantee, Interview prep session, Google Summer of Code preparation, Tech career guidance & mentorship, Free sessions on new technologies, Free with referral code + ₹500",
    color: "purple",
    regularPrice: 3499,
    features: []
  }
];

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Redirect if user is already registered for NSAT
  if (user.user_metadata?.is_nsat_registered) {
    return <Redirect to="/dashboard" />;
  }

  const handlePackageSelect = (pkg: Package) => {
    if (pkg.name === "Basic Package") {
      window.location.href = "https://www.newtonschool.co/newton-school-of-technology-nst/apply-referral?utm_source=referral&utm_medium=santoshpuvvada13&utm_campaign=btech-computer-science-portal-referral";
      return;
    }
    setSelectedPackage(pkg);
    setCurrentStep(2);
  };

  const handlePaymentComplete = (screenshotUrl: string, paymentId: string) => {
    setPaymentScreenshot(screenshotUrl);
    setPaymentId(paymentId);
    setCurrentStep(3);
  };

  const completePayment = () => {
    setPaymentComplete(true);
  };

  const renderStepContent = () => {
    if (paymentComplete) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10"
        >
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {selectedPackage?.name === "Premium Package"
              ? "Your NSAT exam registration is complete with the referral discount. Your Premium Package is now active for just ₹200 (savings of ₹1799)!"
              : selectedPackage?.name === "Ultimate Package"
                ? "Your NSAT exam registration is complete with the referral discount. Your Ultimate Package is now active for just ₹500 (savings of ₹2999)! You now have access to all premium features including GSoC preparation and tech mentorship."
                : `Your payment has been processed successfully. Your ${selectedPackage?.name} is now active.`}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/certificates")}>
              View Certificates
            </Button>
          </div>
        </motion.div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white mr-2">1</span>
              Select a Package
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id 
                      ? `border-2 border-${pkg.color === 'primary' ? pkg.color : pkg.color + '-500'} shadow-md` 
                      : 'hover:border-gray-300 hover:shadow'
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <CardHeader className={`${
                    selectedPackage?.id === pkg.id ? `bg-${pkg.color === 'primary' ? pkg.color : pkg.color + '-500'}/10` : ''
                  }`}>
                    <CardTitle>
                      <div className="flex justify-between items-center">
                        <span>{pkg.name}</span>
                        {selectedPackage?.id === pkg.id && (
                          <CheckCircle className={`h-5 w-5 text-${pkg.color === 'primary' ? pkg.color : pkg.color + '-500'}`} />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pkg.id === "premium" ? (
                      <>
                        <p className="text-2xl font-bold mb-1">₹200 <span className="text-sm font-normal text-muted-foreground">with referral</span></p>
                        <p className="text-xs text-muted-foreground line-through mb-2">₹1999 regular price</p>
                      </>
                    ) : pkg.id === "ultimate" ? (
                      <>
                        <p className="text-2xl font-bold mb-1">₹500 <span className="text-sm font-normal text-muted-foreground">with referral</span></p>
                        <p className="text-xs text-muted-foreground line-through mb-2">₹3499 regular price</p>
                      </>
                    ) : pkg.id === "basic" ? (
                      <>
                        <p className="text-2xl font-bold mb-2">Free <span className="text-sm font-normal text-muted-foreground">with referral</span></p>
                      </>
                    ) : (
                      <p className="text-2xl font-bold mb-2">₹{pkg.price}</p>
                    )}
                    <p className="text-muted-foreground text-sm mb-4">{pkg.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">2. Make Payment</h2>
            {selectedPackage && (
              <QRCodePayment
                amount={selectedPackage.id === "premium" ? 200 : selectedPackage.id === "ultimate" ? 500 : selectedPackage.price}
                packageId={selectedPackage.id}
                packageName={selectedPackage.name}
                onPaymentComplete={handlePaymentComplete}
              />
            )}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">3. Order Confirmation</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-4">Payment Screenshot</h3>
                    {paymentScreenshot && (
                      <img
                        src={paymentScreenshot}
                        alt="Payment Confirmation"
                        className="w-full max-w-md rounded-lg border"
                      />
                    )}
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      Thank you for your payment! Your order is being processed.
                      Payment ID: {paymentId}
                      You will receive a confirmation email shortly.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Order Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Package: {selectedPackage?.name}<br />
                      Amount Paid: ₹{selectedPackage?.id === "premium" ? 200 : selectedPackage?.id === "ultimate" ? 500 : selectedPackage?.price}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!paymentComplete && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Checkout</h1>
              <div className="hidden md:flex items-center">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        currentStep >= step 
                          ? 'bg-primary text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div 
                        className={`h-1 w-12 ${
                          currentStep > step ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Step {currentStep} of 3
                </span>
                <span className="text-sm text-muted-foreground">
                  {currentStep === 1 ? 'Package Selection' : 
                   currentStep === 2 ? 'Payment' : 'Order Confirmation'}
                </span>
              </div>
              <div className="w-full bg-muted h-1 rounded-full">
                <div 
                  className="bg-primary h-1 rounded-full" 
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {renderStepContent()}

        {!paymentComplete && currentStep === 3 && (
          <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(2)}
            >
              Back
            </Button>
            
            <Button 
              onClick={completePayment}
              className="bg-primary"
            >
              Complete Order
            </Button>
          </div>
        )}

        {!paymentComplete && currentStep < 3 && (
          <div className="mt-10 flex flex-col-reverse sm:flex-row justify-between">
            <Button 
              variant="outline" 
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate("/dashboard")}
            >
              {currentStep > 1 ? 'Back' : 'Cancel'}
            </Button>
            
            {currentStep === 1 && (
              <Button 
                onClick={() => selectedPackage && setCurrentStep(2)}
                disabled={!selectedPackage}
              >
                Continue
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
