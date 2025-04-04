import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/privacy" />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Privacy Policy
              </h1>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-8">
                  Last updated: April 5, 2025
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
                <p>
                  This Privacy Policy explains how Izzy AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, and shares your personal information when you use our interview preparation service (the &quot;Service&quot;).
                </p>
                <p>
                  By using the Service, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Service.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
                <p>
                  We collect several types of information from and about users of our Service:
                </p>
                <ul className="list-disc pl-8 my-4 space-y-2">
                  <li>
                    <strong>Account Information:</strong> When you create an account, we collect your email address and profile information.
                  </li>
                  <li>
                    <strong>Resume Data:</strong> We collect resume information that you upload or enter into the Service, including your work experience, education, and skills.
                  </li>
                  <li>
                    <strong>Job Information:</strong> We collect information about job descriptions and requirements that you provide to the Service.
                  </li>
                  <li>
                    <strong>Interview Responses:</strong> We collect your responses to the practice interview questions.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> We automatically collect information about your interactions with the Service, such as the features you use and the time spent on the Service.
                  </li>
                </ul>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-8 my-4 space-y-2">
                  <li>Provide, operate, and maintain the Service</li>
                  <li>Personalize your experience with tailored interview questions</li>
                  <li>Analyze your responses and provide feedback</li>
                  <li>Track your progress and improvement over time</li>
                  <li>Improve and develop the Service</li>
                  <li>Respond to your requests and support needs</li>
                  <li>Enforce our Terms of Service and protect against misuse</li>
                </ul>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
                <p>
                  Our Service uses the following third-party services:
                </p>
                <ul className="list-disc pl-8 my-4 space-y-2">
                  <li>
                    <strong>Supabase:</strong> For user authentication and database storage. You can review Supabase&apos;s privacy policy at <a href="https://supabase.com/privacy" className="text-primary hover:underline">https://supabase.com/privacy</a>.
                  </li>
                  <li>
                    <strong>OpenAI:</strong> For natural language processing capabilities. You can review OpenAI&apos;s privacy policy at <a href="https://openai.com/policies/privacy-policy" className="text-primary hover:underline">https://openai.com/policies/privacy-policy</a>.
                  </li>
                  <li>
                    <strong>SerpAPI:</strong> For retrieving job-specific information from the web. You can review SerpAPI&apos;s privacy policy at <a href="https://serpapi.com/privacy" className="text-primary hover:underline">https://serpapi.com/privacy</a>.
                  </li>
                </ul>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
                <p>
                  We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no internet transmission or electronic storage is completely secure.
                </p>
                <p>
                  Your account is protected by a password. You are responsible for maintaining the confidentiality of your password and for any activities that occur under your account.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
                <p>
                  We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, or as required by law.
                </p>
                <p>
                  For anonymous users, data is stored temporarily and may be deleted after a period of inactivity.
                </p>
                <p>
                  You can request deletion of your account and associated data at any time by contacting us.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
                <p>
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-8 my-4 space-y-2">
                  <li>The right to access the personal information we hold about you</li>
                  <li>The right to correct inaccurate or incomplete information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to restrict or object to our processing of your personal information</li>
                  <li>The right to data portability</li>
                </ul>
                <p>
                  To exercise these rights, please contact us through the GitHub repository for this project.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children&apos;s Privacy</h2>
                <p>
                  Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through the GitHub repository for this project.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}