import { Building2 } from 'lucide-react';
import { FAQSection } from '../components/FAQSection';

export function FAQ() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about congresson.ai and how it can help you stay informed about legislative activities.
        </p>
      </div>

      <FAQSection
        title="About Congress DAO"
        icon={<Building2 className="w-6 h-6 text-primary-600" />}
        questions={[
          {
            question: "What is CongressOnAI?",
            answer: (
              <>
                <p>
                  CongressOnAI is a decentralized platform that leverages AI technology to make congressional information more accessible and transparent. Our platform provides:
                </p>
                <ul>
                  <li>Real-time bill tracking and analysis</li>
                  <li>AI-powered summaries and explanations</li>
                  <li>Community-driven governance through DAO structure</li>
                </ul>
              </>
            ),
          },
          {
            question: "How does the AI analysis work?",
            answer: (
              <p>
                Our AI system processes legislative documents using advanced natural language processing to provide clear, accurate summaries and insights. It analyzes bill text, amendments, and related documents to help users understand complex legislation.
              </p>
            ),
          },
          {
            question: "What's the purpose of CongressOnAI?",
            answer: (
              <section style={{fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333'}}>
                <div style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
                  <h2 style={{textAlign: 'center', color: '#2c3e50'}}>The Purpose of Congresson.ai</h2>
                  <p style={{fontSize: '1.1em', marginBottom: '20px', textAlign: 'justify'}}>
                    congresson.ai is designed to make the legislative process more transparent and accessible to everyone. By leveraging advanced AI platforms, the website empowers users to gain a deeper understanding of congressional bills. It provides clear, concise explanations, tracks sentiment and key points within legislation, and offers personalized insights.
                  </p>
                  <p style={{fontSize: '1.1em', marginBottom: '20px', textAlign: 'justify'}}>
                    Whether you're a concerned citizen, policy enthusiast, or decision-maker, Congresson.ai helps you navigate complex legislative language with ease. With a development roadmap focused on innovation, Congresson.ai aims to enhance civic engagement, ensuring that everyone can stay informed and involved in shaping their communities.
                  </p>
                </div>
              </section>
            ),
          },
          {
            question: "How can I contribute?",
            answer: (
              <p>
                We welcome contributions from the community! 
                You can contribute by submitting pull requests to our GitHub repository, helping write content, spreading the word about the website, and promoting congress transparency.<br />
                Send the website to your local congressperson, and ask them to support the website to promote congress transparency.
              </p>
            ),
          },
        ]}
      />
    </div>
  );
}