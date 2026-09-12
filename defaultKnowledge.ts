import { KnowledgeBase } from '../types';

export const defaultKnowledge: KnowledgeBase = {
  companyName: 'Apex Cloud Solutions',
  tagline: 'Enterprise Cloud Architecture, 24/7 Managed DevOps & SOC 2 Security',
  operatingHours: 'Monday to Saturday, 9:30 AM to 6:30 PM IST',
  contactPhone: '+91 98765 43210',
  contactEmail: 'contact@apexcloud.in',
  escalationManager: 'Rohan Sharma (Director of Client Operations, Ext 104)',
  services: [
    {
      name: 'Enterprise Cloud Migration',
      description: 'End-to-end zero-downtime cloud migration for AWS, Google Cloud, and Azure.',
      pricing: '₹75,000 (Pachhattar hazar rupaye) fixed engagement'
    },
    {
      name: '24/7 Managed DevOps & SRE',
      description: 'Kubernetes cluster management, automated CI/CD pipelines, and 99.99% uptime SLA.',
      pricing: '₹35,000 (Paintis hazar rupaye) monthly retainer'
    },
    {
      name: 'Cybersecurity & SOC 2 Audit',
      description: 'Cloud posture hardening, penetration testing, and fast-track compliance certification.',
      pricing: '₹50,000 (Pachaas hazar rupaye) comprehensive audit'
    }
  ],
  faqs: [
    {
      q: 'Kya emergency 24/7 support available hai?',
      a: 'Haan, hamare managed retainer clients ko 15-minute response SLA ke saath 24/7 emergency incident support milta hai.'
    },
    {
      q: 'Do you offer emergency on-call support?',
      a: 'Yes, all managed retainer clients receive 24/7 emergency incident response within 15 minutes.'
    },
    {
      q: 'Infrastructure assessment me kitna time lagta hai?',
      a: 'Hamari architectural aur security audit team 5 business days me complete assessment report deliver karti hai.'
    },
    {
      q: 'Can we schedule a technical discovery call?',
      a: 'Yes, Depioro can check open calendar availability and book a 30-minute consultation with our Lead Architect.'
    }
  ]
};
