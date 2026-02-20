from rest_framework import serializers
from .models import User


class UserSignupSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone']

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone')
        )

        return user
from django.contrib.auth import authenticate


class UserLoginSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):

        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid username or password")

        data["user"] = user
        return data
