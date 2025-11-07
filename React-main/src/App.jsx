import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    monthlySalary: "",
    existingEMI: "",
    loanAmount: ""
  });

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }

    if (!formData.monthlySalary) {
      newErrors.monthlySalary = 'Monthly salary is required';
    } else if (formData.monthlySalary < 0) {
      newErrors.monthlySalary = 'Monthly salary cannot be negative';
    } else if (formData.monthlySalary < 15000) {
      newErrors.monthlySalary = 'Minimum monthly salary should be ₹15,000';
    }

    if (!formData.existingEMI) {
      newErrors.existingEMI = 'Existing EMI is required';
    } else if (formData.existingEMI < 0) {
      newErrors.existingEMI = 'Existing EMI cannot be negative';
    }

    if (!formData.loanAmount) {
      newErrors.loanAmount = 'Loan amount is required';
    } else if (formData.loanAmount < 0) {
      newErrors.loanAmount = 'Loan amount cannot be negative';
    } else if (formData.loanAmount < 50000) {
      newErrors.loanAmount = 'Minimum loan amount is ₹50,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEligibility = () => {
    if (!validateForm()) {
      return;
    }

    const { age, monthlySalary, existingEMI, loanAmount } = formData;
    
    const ageNum = parseInt(age);
    const salaryNum = parseFloat(monthlySalary);
    const existingEMINum = parseFloat(existingEMI);
    const loanAmountNum = parseFloat(loanAmount);

    // Indian loan parameters
    const interestRate = 0.105; // 10.5% annual interest (typical for personal loans)
    const tenureMonths = 60; // 5 years tenure (common in India)
    const monthlyInterest = interestRate / 12;
    
    // Calculate EMI using standard formula
    const proposedEMI = (loanAmountNum * monthlyInterest * Math.pow(1 + monthlyInterest, tenureMonths)) / 
                       (Math.pow(1 + monthlyInterest, tenureMonths) - 1);

    const reasons = [];
    let isEligible = true;

    // Indian Age criteria: 21 to 65 years
    if (ageNum < 21 || ageNum > 65) {
      reasons.push('Age must be between 21 and 65 years');
      isEligible = false;
    }

    // Indian Loan Amount criteria: Maximum 15 times monthly salary
    const maxLoanAmount = 15 * salaryNum;
    if (loanAmountNum > maxLoanAmount) {
      reasons.push(`Loan amount cannot exceed 15 times your monthly salary (Maximum: ₹${maxLoanAmount.toLocaleString('en-IN')})`);
      isEligible = false;
    }

    // Indian DTI criteria: Maximum 50%
    const dti = ((existingEMINum + proposedEMI) / salaryNum) * 100;
    if (dti > 50) {
      reasons.push(`Debt-to-Income Ratio (${dti.toFixed(2)}%) exceeds 50% limit`);
      isEligible = false;
    }

    // Additional Indian criteria: Minimum salary requirement
    if (salaryNum < 25000 && loanAmountNum > 500000) {
      reasons.push('For loans above ₹5,00,000, minimum salary should be ₹25,000 per month');
      isEligible = false;
    }

    setResult({
      isEligible,
      reasons,
      dti: dti.toFixed(2),
      proposedEMI: proposedEMI.toFixed(2),
      totalPayable: (proposedEMI * tenureMonths).toFixed(2),
      interestPayable: ((proposedEMI * tenureMonths) - loanAmountNum).toFixed(2)
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      monthlySalary: "",
      existingEMI: "",
      loanAmount: ""
    });
    setResult(null);
    setErrors({});
  };

  // Format currency in Indian Rupees
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="text-center mb-0">Loan Eligibility Checker</h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <input
                      type="number"
                      className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                    {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="monthlySalary" className="form-label">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.monthlySalary ? 'is-invalid' : ''}`}
                      id="monthlySalary"
                      name="monthlySalary"
                      value={formData.monthlySalary}
                      onChange={handleInputChange}
                      placeholder="Enter monthly salary"
                      min="0"
                      step="1"
                    />
                    {errors.monthlySalary && <div className="invalid-feedback">{errors.monthlySalary}</div>}
                    <div className="form-text">Minimum: ₹15,000 per month</div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="existingEMI" className="form-label">Existing EMI/Debts (₹)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.existingEMI ? 'is-invalid' : ''}`}
                      id="existingEMI"
                      name="existingEMI"
                      value={formData.existingEMI}
                      onChange={handleInputChange}
                      placeholder="Enter existing EMI"
                      min="0"
                      step="1"
                    />
                    {errors.existingEMI && <div className="invalid-feedback">{errors.existingEMI}</div>}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="loanAmount" className="form-label">Loan Amount Requested (₹)</label>
                <input
                  type="number"
                  className={`form-control ${errors.loanAmount ? 'is-invalid' : ''}`}
                  id="loanAmount"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  placeholder="Enter loan amount"
                  min="0"
                  step="1"
                />
                {errors.loanAmount && <div className="invalid-feedback">{errors.loanAmount}</div>}
                <div className="form-text">Minimum: ₹50,000</div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button 
                  className="btn btn-secondary me-md-2" 
                  onClick={resetForm}
                >
                  Reset
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={checkEligibility}
                >
                  Check Loan Eligibility
                </button>
              </div>

              {result && (
                <div className={`mt-4 p-3 border rounded ${result.isEligible ? 'border-success' : 'border-danger'}`}>
                  <h4 className={result.isEligible ? 'text-success' : 'text-danger'}>
                    {result.isEligible ? '✓ Eligible for Loan' : '✗ Not Eligible for Loan'}
                  </h4>
                  
                  {result.isEligible ? (
                    <div className="text-success">
                      <p>Congratulations! You are eligible for the loan.</p>
                      <div className="loan-details mt-3">
                        <h6>Loan Details:</h6>
                        <table className="table table-sm table-bordered">
                          <tbody>
                            <tr>
                              <td><strong>Debt-to-Income Ratio:</strong></td>
                              <td>{result.dti}%</td>
                            </tr>
                            <tr>
                              <td><strong>Proposed Monthly EMI:</strong></td>
                              <td>₹{formatINR(result.proposedEMI)}</td>
                            </tr>
                            <tr>
                              <td><strong>Loan Tenure:</strong></td>
                              <td>5 years (60 months)</td>
                            </tr>
                            <tr>
                              <td><strong>Interest Rate:</strong></td>
                              <td>10.5% per annum</td>
                            </tr>
                            <tr>
                              <td><strong>Total Interest Payable:</strong></td>
                              <td>₹{formatINR(result.interestPayable)}</td>
                            </tr>
                            <tr>
                              <td><strong>Total Amount Payable:</strong></td>
                              <td>₹{formatINR(result.totalPayable)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-danger">
                      <p>Sorry, you are not eligible for the loan due to the following reasons:</p>
                      <ul>
                        {result.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                      <p><strong>Current DTI Ratio:</strong> {result.dti}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;