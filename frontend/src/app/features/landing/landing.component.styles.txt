.landing-page {
    min-height: calc(100vh - 4rem);
}

.product-preview {
    position: relative;
}

.product-preview::before {
    content: "";
    position: absolute;
    inset: 16px;
    border-radius: 18px;
    border: 1px solid rgba(26, 115, 232, 0.12);
    pointer-events: none;
}

@media (max-width: 640px) {
    .landing-page h1 {
        font-size: 2.5rem;
    }
}
