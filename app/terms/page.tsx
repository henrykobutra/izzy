import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar activePath="/terms" />
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Terms of Service
              </h1>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg mb-8">
                  Last updated: April 5, 2025
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
                <p>
                  Welcome to Izzy AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Izzy AI interview preparation system, including any related services, features, content, and applications (collectively, the &quot;Service&quot;).
                </p>
                <p>
                  By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Academic Project Status</h2>
                <p>
                  Izzy AI is an academic project developed as part of coursework for Houston Community College&apos;s ITAI 2376: Deep Learning course. The Service is provided free of charge for educational and research purposes.
                </p>
                <p>
                  As an academic project, the Service may be subject to changes, limitations, or discontinuation without prior notice. We make no guarantees regarding the continued availability or maintenance of the Service.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts and Data</h2>
                <p>
                  You may use the Service with or without creating an account. If you choose to create an account, you are responsible for maintaining the confidentiality of your account credentials.
                </p>
                <p>
                  We collect and process data as described in our Privacy Policy. By using the Service, you consent to our data practices as described therein.
                </p>
                <p>
                  You retain all rights to the resume content and other information you provide to the Service. However, you grant us a non-exclusive, worldwide, royalty-free license to use, copy, process, and store your content for the purpose of providing and improving the Service.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Acceptable Use</h2>
                <p>
                  When using the Service, you agree not to:
                </p>
                <ul className="list-disc pl-8 my-4 space-y-2">
                  <li>Use the Service for any illegal purpose or to violate any laws or regulations</li>
                  <li>Attempt to interfere with or disrupt the integrity or performance of the Service</li>
                  <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                  <li>Use automated methods to access or use the Service without our permission</li>
                  <li>Upload or share content that is unlawful, harmful, threatening, abusive, or otherwise objectionable</li>
                  <li>Impersonate any person or entity or falsely state or misrepresent your affiliation</li>
                </ul>
                <p>
                  We reserve the right to terminate or suspend your access to the Service for any violation of these Terms.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
                <p>
                  The Service, including its original content, features, and functionality, is owned by the project developers and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  The code for this project may be available under specific open-source licensing terms. Please refer to the project repository for details.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p>
                  We do not warrant that the Service will be uninterrupted or error-free, that defects will be corrected, or that the Service is free of viruses or other harmful components.
                </p>
                <p>
                  As an AI-based system, the Service provides suggestions and simulated interviews for educational purposes only. We make no guarantees regarding the accuracy, completeness, or usefulness of the information provided.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
                <p>
                  IN NO EVENT SHALL THE PROJECT DEVELOPERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
                <p>
                  We reserve the right to modify or replace these Terms at any time. If we make material changes, we will provide notice through the Service or by other means.
                </p>
                <p>
                  Your continued use of the Service after any changes to these Terms constitutes your acceptance of the revised Terms.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us through the GitHub repository for this project.
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