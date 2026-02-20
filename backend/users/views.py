from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSignupSerializer


# -----------------------------------------
# SIGNUP VIEW
# -----------------------------------------

class SignupView(APIView):

    permission_classes = [AllowAny]   # ✅ allow public access

    def post(self, request):

        serializer = UserSignupSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# -----------------------------------------
# LOGIN VIEW
# -----------------------------------------

class LoginAPIView(APIView):

    permission_classes = [AllowAny]   # ✅ THIS FIXES YOUR ERROR

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:

            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:

            return Response(
                {"error": "Invalid username or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({

            "message": "Login successful",

            "access": str(refresh.access_token),

            "refresh": str(refresh),

            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }

        }, status=status.HTTP_200_OK)
