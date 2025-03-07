// src/components/Commons/Testimonials.jsx
import React from 'react';
import './Testimonials.css';

const testimonialsData = [
  { id: 1, quote: "Anna transformed our operations.", author: "Jane Doe, CEO, XYZ Corp", avatar: "/images/avatar1.jpg" },
  { id: 2, quote: "Our productivity skyrocketed with Anna.", author: "John Smith, Founder, ABC Inc.", avatar: "/images/avatar2.jpg" },
  { id: 3, quote: "A game changer for virtual staffing!", author: "Alice Johnson, Director, LMN Ltd.", avatar: "/images/avatar3.jpg" },
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>What Our Clients Say</h2>
      <div className="testimonials-container">
        {testimonialsData.map((testimonial) => (
          <div key={testimonial.id} className="testimonial-card">
            <img src={testimonial.avatar} alt={testimonial.author} />
            <p className="quote">"{testimonial.quote}"</p>
            <p className="author">{testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
